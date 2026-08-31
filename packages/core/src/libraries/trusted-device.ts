import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

import {
  TrustedDevices,
  type ManagementApiContext,
  type TrustedDevice,
  type TrustedDeviceEventData,
} from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';
import { type Context } from 'koa';

import { EnvSet } from '#src/env-set/index.js';
import type { TrustedDeviceMetadata, TrustedDeviceQueries } from '#src/queries/trusted-device.js';

import type { HookContextManager } from './hook/context-manager.js';
import type {
  createTrustedDevicePolicyLibrary,
  EffectiveTrustedDevicePolicy,
} from './trusted-device-policy.js';

const trustedDeviceSecretByteLength = 32;
const trustedDeviceSecretHashAlgorithm = 'sha256';
const trustedDeviceCookiePrefix = 'logto-trusted-device-';
const trustedDeviceOptOutCookiePrefix = 'logto-device-trust-opt-out-';
const trustedDeviceOptOutCookieValue = '1';
const trustedDeviceCleanupCooldown = 5 * 60 * 1000;
const dayInMilliseconds = 24 * 60 * 60 * 1000;
const trustedDeviceIdPattern = /^[\da-z]+$/;

export type TrustedDeviceCookieContext = Readonly<{
  cookies: Pick<Context['cookies'], 'get' | 'set'>;
}>;

type TrustedDeviceCredential = Readonly<{
  id: string;
  secret: string;
}>;

type TrustedDeviceLibraryOptions = Readonly<{
  isProduction?: boolean;
  cleanupCooldown?: number;
}>;

type CreateTrustedDeviceCredential = TrustedDeviceMetadata &
  Readonly<{
    ctx: TrustedDeviceCookieContext;
    deviceId: string;
    effectivePolicy?: EffectiveTrustedDevicePolicy;
    userId: string;
  }>;

type TrustedDevicePolicyLibrary = ReturnType<typeof createTrustedDevicePolicyLibrary>;

type TrustedDeviceLifecycleContext = Pick<HookContextManager, 'appendDataHookContext'>;

export const getTrustedDeviceEventData = ({
  id,
  userId,
  expiresAt,
}: TrustedDevice): TrustedDeviceEventData => ({ id, userId, expiresAt });

const getUserScopedCookieName = (
  prefix: string,
  tenantId: string,
  userId: string,
  isProduction: boolean
) => {
  const subjectHash = createHash(trustedDeviceSecretHashAlgorithm)
    .update(`${tenantId}:${userId}`)
    .digest('base64url');
  const name = `${prefix}${subjectHash}`;

  return isProduction ? `__Host-${name}` : name;
};

export const getTrustedDeviceCookieName = (
  tenantId: string,
  userId: string,
  isProduction: boolean
) => getUserScopedCookieName(trustedDeviceCookiePrefix, tenantId, userId, isProduction);

export const getTrustedDeviceOptOutCookieName = (
  tenantId: string,
  userId: string,
  isProduction: boolean
) => getUserScopedCookieName(trustedDeviceOptOutCookiePrefix, tenantId, userId, isProduction);

export const generateTrustedDeviceSecret = () =>
  randomBytes(trustedDeviceSecretByteLength).toString('base64url');

const decodeTrustedDeviceSecret = (secret: string) => {
  if (!/^[\w-]+$/.test(secret)) {
    return;
  }

  const decoded = Buffer.from(secret, 'base64url');

  if (
    decoded.byteLength !== trustedDeviceSecretByteLength ||
    decoded.toString('base64url') !== secret
  ) {
    return;
  }

  return decoded;
};

const isTrustedDeviceId = (id: string) =>
  TrustedDevices.guard.shape.id.safeParse(id).success && trustedDeviceIdPattern.test(id);

const hashTrustedDeviceSecretBytes = (secret: Uint8Array) =>
  createHash(trustedDeviceSecretHashAlgorithm).update(secret).digest();

export const hashTrustedDeviceSecret = (secret: string) =>
  hashTrustedDeviceSecretBytes(Buffer.from(secret, 'base64url'));

export const verifyTrustedDeviceSecret = (secret: string, expectedHash: Uint8Array) => {
  const decoded = decodeTrustedDeviceSecret(secret);

  if (!decoded) {
    return false;
  }

  const actualHash = hashTrustedDeviceSecretBytes(decoded);

  return (
    actualHash.byteLength === expectedHash.byteLength && timingSafeEqual(actualHash, expectedHash)
  );
};

export const serializeTrustedDeviceCredential = ({ id, secret }: TrustedDeviceCredential) =>
  `${id}.${secret}`;

export const parseTrustedDeviceCredential = (
  value: string
): TrustedDeviceCredential | undefined => {
  const [id, secret, extra] = value.split('.');

  if (
    !id ||
    !isTrustedDeviceId(id) ||
    !secret ||
    extra !== undefined ||
    !decodeTrustedDeviceSecret(secret)
  ) {
    return;
  }

  return { id, secret };
};

export const createTrustedDeviceLibrary = (
  tenantId: string,
  queries: TrustedDeviceQueries,
  policyLibrary: TrustedDevicePolicyLibrary,
  {
    // Integration tests run the production build over HTTP. Production cookie attributes are
    // covered by unit tests, while browser-level tests need a credential the HTTP harness can use.
    isProduction = EnvSet.values.isProduction && !EnvSet.values.isIntegrationTest,
    cleanupCooldown = trustedDeviceCleanupCooldown,
  }: TrustedDeviceLibraryOptions = {}
) => {
  // eslint-disable-next-line @silverhand/fp/no-let -- Track cooldown state within this tenant library instance.
  let lastCleanupAt = 0;

  const getCookieName = (userId: string) =>
    getTrustedDeviceCookieName(tenantId, userId, isProduction);
  const getOptOutCookieName = (userId: string) =>
    getTrustedDeviceOptOutCookieName(tenantId, userId, isProduction);

  const hasCredential = (ctx: TrustedDeviceCookieContext, userId: string) =>
    Boolean(ctx.cookies.get(getCookieName(userId), { signed: false }));

  const hasOptOut = (ctx: TrustedDeviceCookieContext, userId: string) =>
    ctx.cookies.get(getOptOutCookieName(userId), { signed: false }) ===
    trustedDeviceOptOutCookieValue;

  const clearCredential = (ctx: TrustedDeviceCookieContext, userId: string) => {
    ctx.cookies.set(getCookieName(userId), '', {
      expires: new Date(0),
      httpOnly: true,
      maxAge: 0,
      overwrite: true,
      path: '/',
      sameSite: 'lax',
      secure: isProduction,
      signed: false,
    });
  };

  const writeCredential = (
    ctx: TrustedDeviceCookieContext,
    userId: string,
    credential: TrustedDeviceCredential,
    expiresAt: number
  ) => {
    ctx.cookies.set(getCookieName(userId), serializeTrustedDeviceCredential(credential), {
      expires: new Date(expiresAt),
      httpOnly: true,
      maxAge: Math.max(0, expiresAt - Date.now()),
      overwrite: true,
      path: '/',
      sameSite: 'lax',
      secure: isProduction,
      signed: false,
    });
  };

  const writeOptOut = (ctx: TrustedDeviceCookieContext, userId: string, durationDays: number) => {
    const expiresAt = Date.now() + durationDays * dayInMilliseconds;

    ctx.cookies.set(getOptOutCookieName(userId), trustedDeviceOptOutCookieValue, {
      expires: new Date(expiresAt),
      httpOnly: true,
      maxAge: Math.max(0, expiresAt - Date.now()),
      overwrite: true,
      path: '/',
      sameSite: 'lax',
      secure: isProduction,
      signed: false,
    });
  };

  const cleanupExpired = async () => {
    const now = Date.now();

    if (now - lastCleanupAt < cleanupCooldown) {
      return;
    }

    // eslint-disable-next-line @silverhand/fp/no-mutation -- Reserve this cleanup window before the asynchronous delete.
    lastCleanupAt = now;
    const deletedCount = await trySafe(async () => queries.deleteExpiredByTenant());

    if (deletedCount === undefined) {
      // eslint-disable-next-line @silverhand/fp/no-mutation -- Allow the next opportunity to retry a failed cleanup.
      lastCleanupAt = 0;
    }

    return deletedCount;
  };

  const createCredential = async ({
    ctx,
    deviceId,
    effectivePolicy,
    userId,
    ...metadata
  }: CreateTrustedDeviceCredential) => {
    const policy = effectivePolicy ?? (await policyLibrary.getEffectivePolicy(userId));

    if (!policy.enabled) {
      return;
    }

    const secret = generateTrustedDeviceSecret();
    const secretHash = hashTrustedDeviceSecret(secret);
    const expiresAt = Date.now() + policy.durationDays * dayInMilliseconds;
    const trustedDevice = await queries.insertIfNotExists({
      id: deviceId,
      userId,
      secretHash,
      expiresAt,
      ...metadata,
    });

    // Another submit with the same creation intent may have won the insert race. Only the winner
    // writes its matching random credential, so a late response can never replace the cookie
    // with a credential whose record was not persisted.
    if (!trustedDevice) {
      return;
    }

    const credential = { id: deviceId, secret };

    writeCredential(ctx, userId, credential, trustedDevice.expiresAt);
    void cleanupExpired();

    return trustedDevice;
  };

  const validateCredential = async (ctx: TrustedDeviceCookieContext, userId: string) => {
    const cookieValue = ctx.cookies.get(getCookieName(userId), { signed: false });

    if (!cookieValue) {
      return;
    }

    const credential = parseTrustedDeviceCredential(cookieValue);

    if (!credential) {
      clearCredential(ctx, userId);
      return;
    }

    const trustedDevice = await queries.findActiveByIdAndUserId(credential.id, userId);

    if (!trustedDevice) {
      clearCredential(ctx, userId);
      return;
    }

    if (!verifyTrustedDeviceSecret(credential.secret, trustedDevice.secretHash)) {
      clearCredential(ctx, userId);
      return;
    }

    return trustedDevice;
  };

  const updateMetadata = async (
    trustedDeviceId: string,
    userId: string,
    metadata: TrustedDeviceMetadata
  ) => {
    const trustedDevice = await queries.updateMetadataByIdAndUserId(
      trustedDeviceId,
      userId,
      metadata
    );
    void cleanupExpired();

    return trustedDevice;
  };

  const deleteByIdAndUserId = async (
    ctx: TrustedDeviceLifecycleContext,
    id: string,
    userId: string,
    hookContext: Partial<ManagementApiContext> = {}
  ) => {
    const trustedDevice = await queries.deleteByIdAndUserId(id, userId);

    if (!trustedDevice) {
      return;
    }

    ctx.appendDataHookContext('TrustedDevice.Deleted', {
      ...hookContext,
      data: getTrustedDeviceEventData(trustedDevice),
      // Trusted-device lifecycle payloads intentionally exclude the request IP.
      includeRequestIp: false,
    });

    return trustedDevice;
  };

  return {
    cleanupExpired,
    clearCredential,
    createCredential,
    deleteByIdAndUserId,
    getCookieName,
    hasCredential,
    hasOptOut,
    updateMetadata,
    validateCredential,
    writeCredential,
    writeOptOut,
  };
};
