/* eslint-disable max-lines -- Credential and lifecycle behavior share security-sensitive fixtures. */
import { createHash } from 'node:crypto';

import type { TrustedDevice } from '@logto/schemas';

import { createMockTrustedDevice } from '#src/__mocks__/trusted-device.js';
import type { TrustedDeviceQueries } from '#src/queries/trusted-device.js';

import type { createTrustedDevicePolicyLibrary } from './trusted-device-policy.js';
import {
  createTrustedDeviceLibrary,
  generateTrustedDeviceSecret,
  getTrustedDeviceCookieName,
  hashTrustedDeviceSecret,
  parseTrustedDeviceCredential,
  serializeTrustedDeviceCredential,
  type TrustedDeviceCookieContext,
  verifyTrustedDeviceSecret,
} from './trusted-device.js';

const { jest } = import.meta;

const tenantId = 'tenant-id';
const userId = 'user-id';
const trustedDeviceId = 'trusteddeviceid';

const createCookieContext = (value?: string) => {
  const get = jest.fn(
    (..._args: Parameters<TrustedDeviceCookieContext['cookies']['get']>) => value
  ) as jest.MockedFunction<TrustedDeviceCookieContext['cookies']['get']>;
  const set = jest.fn() as jest.MockedFunction<TrustedDeviceCookieContext['cookies']['set']>;
  const ctx = { cookies: { get, set } } as unknown as TrustedDeviceCookieContext;

  return { ctx, get, set };
};

const createQueries = () =>
  ({
    insertIfNotExists: jest.fn(),
    findActiveByIdAndUserId: jest.fn(),
    updateMetadataByIdAndUserId: jest.fn(),
    deleteByIdAndUserId: jest.fn(),
    deleteExpiredByTenant: jest.fn(),
  }) as unknown as jest.Mocked<TrustedDeviceQueries>;

type TrustedDevicePolicyLibrary = ReturnType<typeof createTrustedDevicePolicyLibrary>;

const createPolicyLibrary = ({ enabled = true, durationDays = 30 } = {}) =>
  ({
    getEffectivePolicy: jest.fn(async () => ({ enabled, durationDays })),
  }) as unknown as TrustedDevicePolicyLibrary;

const buildTrustedDevice = (secretHash: Uint8Array): TrustedDevice =>
  createMockTrustedDevice({
    tenantId,
    id: trustedDeviceId,
    userId,
    secretHash: Buffer.from(secretHash),
    expiresAt: Date.now() + 60_000,
  });

describe('trusted device credential helpers', () => {
  it('builds deterministic non-identifying per-user cookie names', () => {
    const developmentName = getTrustedDeviceCookieName(tenantId, userId, false);
    const productionName = getTrustedDeviceCookieName(tenantId, userId, true);

    expect(developmentName).toMatch(/^logto-trusted-device-[\w-]{43}$/);
    expect(developmentName).not.toContain(tenantId);
    expect(developmentName).not.toContain(userId);
    expect(productionName).toBe(`__Host-${developmentName}`);
    expect(getTrustedDeviceCookieName(tenantId, 'another-user', false)).not.toBe(developmentName);
  });

  it('generates 32-byte secrets and hashes their decoded bytes with SHA-256', () => {
    const secret = generateTrustedDeviceSecret();
    const decoded = Buffer.from(secret, 'base64url');
    const hash = hashTrustedDeviceSecret(secret);

    expect(decoded).toHaveLength(32);
    expect(hash).toEqual(createHash('sha256').update(decoded).digest());
    expect(verifyTrustedDeviceSecret(secret, hash)).toBe(true);
    expect(verifyTrustedDeviceSecret(secret, Buffer.alloc(31))).toBe(false);
  });

  it('round-trips a credential and rejects malformed values', () => {
    const credential = { id: trustedDeviceId, secret: generateTrustedDeviceSecret() };

    expect(parseTrustedDeviceCredential(serializeTrustedDeviceCredential(credential))).toEqual(
      credential
    );

    expect(parseTrustedDeviceCredential('missing-secret')).toBeUndefined();
    expect(parseTrustedDeviceCredential(`id.${credential.secret}.extra`)).toBeUndefined();
    expect(parseTrustedDeviceCredential(`${'a'.repeat(22)}.${credential.secret}`)).toBeUndefined();
    expect(parseTrustedDeviceCredential(`${'A'.repeat(21)}.${credential.secret}`)).toBeUndefined();
    expect(parseTrustedDeviceCredential(`id.not-base64!`)).toBeUndefined();
    expect(parseTrustedDeviceCredential(`id.${credential.secret.slice(1)}`)).toBeUndefined();
  });
});

describe('trusted device library', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('checks for an unsigned user-specific trusted-device cookie', () => {
    const queries = createQueries();
    const { ctx, get } = createCookieContext('credential');
    const library = createTrustedDeviceLibrary(tenantId, queries, createPolicyLibrary(), {
      isProduction: false,
    });

    expect(library.hasCredential(ctx, userId)).toBe(true);
    expect(get).toHaveBeenCalledWith(getTrustedDeviceCookieName(tenantId, userId, false), {
      signed: false,
    });

    const { ctx: emptyContext } = createCookieContext();

    expect(library.hasCredential(emptyContext, userId)).toBe(false);
  });

  it('creates a record with only the secret hash and writes an unsigned host-only cookie', async () => {
    const now = Date.now();
    const durationDays = 7;
    const expiresAt = now + durationDays * 24 * 60 * 60 * 1000;
    const queries = createQueries();
    const policyLibrary = createPolicyLibrary({ durationDays });
    const { ctx, set } = createCookieContext();

    jest.spyOn(Date, 'now').mockReturnValue(now);

    queries.insertIfNotExists.mockImplementationOnce(async (data) => ({
      tenantId,
      userAgent: null,
      ip: null,
      country: null,
      city: null,
      createdAt: now,
      lastUsedAt: now,
      ...data,
    }));
    queries.deleteExpiredByTenant.mockResolvedValueOnce(0);

    const library = createTrustedDeviceLibrary(tenantId, queries, policyLibrary, {
      isProduction: false,
    });
    const record = await library.createCredential({ ctx, deviceId: trustedDeviceId, userId });

    if (!record) {
      throw new Error('Expected trusted-device creation to be allowed');
    }

    const inserted = queries.insertIfNotExists.mock.calls[0]?.[0];
    const cookieValue = set.mock.calls[0]?.[1];
    const parsed =
      typeof cookieValue === 'string' ? parseTrustedDeviceCredential(cookieValue) : null;

    expect(inserted?.id).toBe(record.id);
    expect(inserted?.userId).toBe(userId);
    expect(inserted?.expiresAt).toBe(expiresAt);
    expect(parsed?.id).toBe(record.id);
    expect(inserted?.secretHash).toEqual(
      parsed ? hashTrustedDeviceSecret(parsed.secret) : undefined
    );
    expect(JSON.stringify(inserted)).not.toContain(parsed?.secret);
    expect(set).toHaveBeenCalledWith(
      getTrustedDeviceCookieName(tenantId, userId, false),
      expect.any(String),
      expect.objectContaining({
        expires: new Date(expiresAt),
        httpOnly: true,
        overwrite: true,
        path: '/',
        sameSite: 'lax',
        secure: false,
        signed: false,
      })
    );
    expect(set.mock.calls[0]?.[2]?.maxAge).toBeLessThanOrEqual(expiresAt - now);
    expect(set.mock.calls[0]?.[2]).not.toHaveProperty('domain');
    expect(policyLibrary.getEffectivePolicy).toHaveBeenCalledWith(userId);
    expect(queries.deleteExpiredByTenant).toHaveBeenCalledTimes(1);
  });

  it('does not create a record or cookie when the effective policy is disabled', async () => {
    const queries = createQueries();
    const policyLibrary = createPolicyLibrary({ enabled: false });
    const { ctx, set } = createCookieContext();
    const library = createTrustedDeviceLibrary(tenantId, queries, policyLibrary, {
      isProduction: false,
    });

    await expect(
      library.createCredential({ ctx, deviceId: trustedDeviceId, userId })
    ).resolves.toBeUndefined();
    expect(queries.insertIfNotExists).not.toHaveBeenCalled();
    expect(set).not.toHaveBeenCalled();
  });

  it('rechecks the effective policy before each creation attempt', async () => {
    const queries = createQueries();
    const getEffectivePolicy = jest
      .fn()
      .mockResolvedValueOnce({ enabled: false, durationDays: 30 })
      .mockResolvedValueOnce({ enabled: true, durationDays: 30 });
    const policyLibrary = { getEffectivePolicy } as unknown as TrustedDevicePolicyLibrary;
    const { ctx, set } = createCookieContext();
    const record = buildTrustedDevice(Buffer.alloc(32));
    queries.insertIfNotExists.mockResolvedValueOnce(record);
    const library = createTrustedDeviceLibrary(tenantId, queries, policyLibrary, {
      isProduction: false,
    });

    await expect(
      library.createCredential({ ctx, deviceId: trustedDeviceId, userId })
    ).resolves.toBeUndefined();
    await expect(
      library.createCredential({ ctx, deviceId: trustedDeviceId, userId })
    ).resolves.toEqual(record);

    expect(getEffectivePolicy).toHaveBeenCalledTimes(2);
    expect(queries.insertIfNotExists).toHaveBeenCalledTimes(1);
    expect(set).toHaveBeenCalledTimes(1);
  });

  it('writes only the credential that wins concurrent creation for an interaction', async () => {
    const queries = createQueries();
    const firstCookie = createCookieContext();
    const secondCookie = createCookieContext();
    queries.insertIfNotExists
      .mockImplementationOnce(async (data) => ({
        tenantId,
        userAgent: null,
        ip: null,
        country: null,
        city: null,
        createdAt: Date.now(),
        lastUsedAt: Date.now(),
        ...data,
      }))
      .mockResolvedValueOnce(null);
    queries.deleteExpiredByTenant.mockResolvedValueOnce(0);
    const library = createTrustedDeviceLibrary(tenantId, queries, createPolicyLibrary(), {
      isProduction: false,
    });

    const results = await Promise.all([
      library.createCredential({ ctx: firstCookie.ctx, deviceId: trustedDeviceId, userId }),
      library.createCredential({ ctx: secondCookie.ctx, deviceId: trustedDeviceId, userId }),
    ]);

    expect(results[0]).toBeDefined();
    expect(results[1]).toBeUndefined();
    expect(queries.insertIfNotExists).toHaveBeenCalledTimes(2);
    expect(queries.insertIfNotExists.mock.calls.map(([data]) => data.id)).toEqual([
      trustedDeviceId,
      trustedDeviceId,
    ]);
    expect(firstCookie.set).toHaveBeenCalledTimes(1);
    expect(secondCookie.set).not.toHaveBeenCalled();
  });

  it('uses Secure and the __Host- prefix in production', () => {
    const queries = createQueries();
    const { ctx, set } = createCookieContext();
    const library = createTrustedDeviceLibrary(tenantId, queries, createPolicyLibrary(), {
      isProduction: true,
    });
    const credential = { id: trustedDeviceId, secret: generateTrustedDeviceSecret() };

    library.writeCredential(ctx, userId, credential, Date.now() + 60_000);

    expect(set).toHaveBeenCalledWith(
      getTrustedDeviceCookieName(tenantId, userId, true),
      serializeTrustedDeviceCredential(credential),
      expect.objectContaining({ secure: true, signed: false, path: '/' })
    );
  });

  it('queues a redacted deletion webhook only after deleting an existing record', async () => {
    const queries = createQueries();
    const trustedDevice = {
      ...buildTrustedDevice(Buffer.alloc(32, 1)),
      ip: '192.0.2.1',
      userAgent: 'private user agent',
    };
    const ctx = { appendDataHookContext: jest.fn() };
    const managementApiContext = {
      path: `/api/users/${userId}/trusted-devices/${trustedDeviceId}`,
      method: 'DELETE',
      status: 204,
      params: { userId, trustedDeviceId },
      matchedRoute: '/api/users/:userId/trusted-devices/:trustedDeviceId',
    };
    queries.deleteByIdAndUserId.mockResolvedValueOnce(trustedDevice).mockResolvedValueOnce(null);
    const library = createTrustedDeviceLibrary(tenantId, queries, createPolicyLibrary());

    await expect(
      library.deleteByIdAndUserId(ctx, trustedDeviceId, userId, managementApiContext)
    ).resolves.toEqual(trustedDevice);
    await expect(
      library.deleteByIdAndUserId(ctx, trustedDeviceId, userId)
    ).resolves.toBeUndefined();

    expect(ctx.appendDataHookContext).toHaveBeenCalledTimes(1);
    expect(ctx.appendDataHookContext).toHaveBeenCalledWith('TrustedDevice.Deleted', {
      ...managementApiContext,
      data: {
        id: trustedDeviceId,
        userId,
        expiresAt: trustedDevice.expiresAt,
      },
      includeRequestIp: false,
    });
    expect(JSON.stringify(ctx.appendDataHookContext.mock.calls)).not.toContain('192.0.2.1');
    expect(JSON.stringify(ctx.appendDataHookContext.mock.calls)).not.toContain(
      'private user agent'
    );
    expect(JSON.stringify(ctx.appendDataHookContext.mock.calls)).not.toContain('secretHash');
  });

  it('does not queue a deletion webhook when the delete query fails', async () => {
    const queries = createQueries();
    const error = new Error('delete failed');
    const ctx = { appendDataHookContext: jest.fn() };
    queries.deleteByIdAndUserId.mockRejectedValueOnce(error);
    const library = createTrustedDeviceLibrary(tenantId, queries, createPolicyLibrary());

    await expect(library.deleteByIdAndUserId(ctx, trustedDeviceId, userId)).rejects.toBe(error);

    expect(ctx.appendDataHookContext).not.toHaveBeenCalled();
  });

  it('reads the unsigned user-specific cookie and validates the active record hash', async () => {
    const secret = generateTrustedDeviceSecret();
    const secretHash = hashTrustedDeviceSecret(secret);
    const record = buildTrustedDevice(secretHash);
    const queries = createQueries();
    const { ctx, get, set } = createCookieContext(
      serializeTrustedDeviceCredential({ id: record.id, secret })
    );
    queries.findActiveByIdAndUserId.mockResolvedValueOnce(record);

    const library = createTrustedDeviceLibrary(tenantId, queries, createPolicyLibrary(), {
      isProduction: false,
    });

    await expect(library.validateCredential(ctx, userId)).resolves.toEqual(record);
    expect(get).toHaveBeenCalledWith(getTrustedDeviceCookieName(tenantId, userId, false), {
      signed: false,
    });
    expect(queries.findActiveByIdAndUserId).toHaveBeenCalledWith(record.id, userId);
    expect(set).not.toHaveBeenCalled();
  });

  it('clears a malformed credential without querying a record', async () => {
    const queries = createQueries();
    const { ctx, set } = createCookieContext('malformed');
    const library = createTrustedDeviceLibrary(tenantId, queries, createPolicyLibrary(), {
      isProduction: false,
    });

    await expect(library.validateCredential(ctx, userId)).resolves.toBeUndefined();
    expect(queries.findActiveByIdAndUserId).not.toHaveBeenCalled();
    expect(set).toHaveBeenCalledWith(
      getTrustedDeviceCookieName(tenantId, userId, false),
      '',
      expect.objectContaining({
        expires: new Date(0),
        maxAge: 0,
        signed: false,
      })
    );
  });

  it('clears a credential with an invalid record ID without querying the database', async () => {
    const queries = createQueries();
    const { ctx, set } = createCookieContext(
      serializeTrustedDeviceCredential({
        id: 'a'.repeat(22),
        secret: generateTrustedDeviceSecret(),
      })
    );
    const library = createTrustedDeviceLibrary(tenantId, queries, createPolicyLibrary(), {
      isProduction: false,
    });

    await expect(library.validateCredential(ctx, userId)).resolves.toBeUndefined();
    expect(queries.findActiveByIdAndUserId).not.toHaveBeenCalled();
    expect(set).toHaveBeenCalledTimes(1);
  });

  it('clears a tampered credential after an equal-length hash comparison fails', async () => {
    const secret = generateTrustedDeviceSecret();
    const otherSecret = generateTrustedDeviceSecret();
    const record = buildTrustedDevice(hashTrustedDeviceSecret(otherSecret));
    const queries = createQueries();
    const { ctx, set } = createCookieContext(
      serializeTrustedDeviceCredential({ id: record.id, secret })
    );
    queries.findActiveByIdAndUserId.mockResolvedValueOnce(record);

    const library = createTrustedDeviceLibrary(tenantId, queries, createPolicyLibrary(), {
      isProduction: false,
    });

    await expect(library.validateCredential(ctx, userId)).resolves.toBeUndefined();
    expect(set).toHaveBeenCalledTimes(1);
  });

  it('clears a credential for a missing or expired record', async () => {
    const secret = generateTrustedDeviceSecret();
    const queries = createQueries();
    const { ctx, set } = createCookieContext(
      serializeTrustedDeviceCredential({ id: trustedDeviceId, secret })
    );
    queries.findActiveByIdAndUserId.mockResolvedValueOnce(null);

    const library = createTrustedDeviceLibrary(tenantId, queries, createPolicyLibrary(), {
      isProduction: false,
    });

    await expect(library.validateCredential(ctx, userId)).resolves.toBeUndefined();

    expect(set).toHaveBeenCalledTimes(1);
  });

  it('updates last-used metadata and schedules opportunistic cleanup', async () => {
    const queries = createQueries();
    const metadata = {
      userAgent: 'Test browser',
      ip: '192.0.2.1',
      country: 'US',
      city: 'Portland',
    };
    const record = buildTrustedDevice(Buffer.alloc(32));
    queries.updateMetadataByIdAndUserId.mockResolvedValueOnce(record);
    queries.deleteExpiredByTenant.mockResolvedValueOnce(0);
    const library = createTrustedDeviceLibrary(tenantId, queries, createPolicyLibrary(), {
      isProduction: false,
    });

    await expect(library.updateMetadata(trustedDeviceId, userId, metadata)).resolves.toEqual(
      record
    );
    expect(queries.updateMetadataByIdAndUserId).toHaveBeenCalledWith(
      trustedDeviceId,
      userId,
      metadata
    );
    expect(queries.deleteExpiredByTenant).toHaveBeenCalledTimes(1);
  });

  it('deduplicates concurrent opportunistic cleanup within the cooldown', async () => {
    const queries = createQueries();
    queries.deleteExpiredByTenant.mockResolvedValue(2);
    const library = createTrustedDeviceLibrary(tenantId, queries, createPolicyLibrary(), {
      isProduction: false,
      cleanupCooldown: 60_000,
    });

    await expect(
      Promise.all([library.cleanupExpired(), library.cleanupExpired(), library.cleanupExpired()])
    ).resolves.toEqual([2, undefined, undefined]);
    expect(queries.deleteExpiredByTenant).toHaveBeenCalledTimes(1);
  });

  it('retries opportunistic cleanup after a failed attempt', async () => {
    const queries = createQueries();
    queries.deleteExpiredByTenant.mockRejectedValueOnce(new Error('cleanup failed'));
    queries.deleteExpiredByTenant.mockResolvedValueOnce(2);
    const library = createTrustedDeviceLibrary(tenantId, queries, createPolicyLibrary(), {
      isProduction: false,
      cleanupCooldown: 60_000,
    });

    await expect(library.cleanupExpired()).resolves.toBeUndefined();
    await expect(library.cleanupExpired()).resolves.toBe(2);
    expect(queries.deleteExpiredByTenant).toHaveBeenCalledTimes(2);
  });
});
/* eslint-enable max-lines */
