import { createHash } from 'node:crypto';

import type { TrustedDevice } from '@logto/schemas';

import type { TrustedDeviceQueries } from '#src/queries/trusted-device.js';

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
    insert: jest.fn(),
    findActiveByIdAndUserId: jest.fn(),
    deleteExpiredByIdAndUserId: jest.fn(),
    deleteExpiredByTenant: jest.fn(),
  }) as unknown as jest.Mocked<TrustedDeviceQueries>;

const buildTrustedDevice = (secretHash: Uint8Array): TrustedDevice => ({
  tenantId,
  id: trustedDeviceId,
  userId,
  secretHash: Buffer.from(secretHash),
  userAgent: null,
  ip: null,
  country: null,
  city: null,
  createdAt: 1,
  lastUsedAt: 1,
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

  it('creates a record with only the secret hash and writes an unsigned host-only cookie', async () => {
    const now = Date.now();
    const expiresAt = now + 60_000;
    const queries = createQueries();
    const { ctx, set } = createCookieContext();

    queries.insert.mockImplementationOnce(async (data) => ({
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

    const library = createTrustedDeviceLibrary(tenantId, queries, { isProduction: false });
    const record = await library.createCredential({ ctx, userId, expiresAt });
    const inserted = queries.insert.mock.calls[0]?.[0];
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
    expect(queries.deleteExpiredByTenant).toHaveBeenCalledTimes(1);
  });

  it('uses Secure and the __Host- prefix in production', () => {
    const queries = createQueries();
    const { ctx, set } = createCookieContext();
    const library = createTrustedDeviceLibrary(tenantId, queries, { isProduction: true });
    const credential = { id: trustedDeviceId, secret: generateTrustedDeviceSecret() };

    library.writeCredential(ctx, userId, credential, Date.now() + 60_000);

    expect(set).toHaveBeenCalledWith(
      getTrustedDeviceCookieName(tenantId, userId, true),
      serializeTrustedDeviceCredential(credential),
      expect.objectContaining({ secure: true, signed: false, path: '/' })
    );
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

    const library = createTrustedDeviceLibrary(tenantId, queries, { isProduction: false });

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
    const library = createTrustedDeviceLibrary(tenantId, queries, { isProduction: false });

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
    const library = createTrustedDeviceLibrary(tenantId, queries, { isProduction: false });

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

    const library = createTrustedDeviceLibrary(tenantId, queries, { isProduction: false });

    await expect(library.validateCredential(ctx, userId)).resolves.toBeUndefined();
    expect(set).toHaveBeenCalledTimes(1);
    expect(queries.deleteExpiredByIdAndUserId).not.toHaveBeenCalled();
  });

  it('silently attempts exact cleanup for a missing or expired presented record', async () => {
    const secret = generateTrustedDeviceSecret();
    const queries = createQueries();
    const { ctx, set } = createCookieContext(
      serializeTrustedDeviceCredential({ id: trustedDeviceId, secret })
    );
    queries.findActiveByIdAndUserId.mockResolvedValueOnce(null);
    queries.deleteExpiredByIdAndUserId.mockResolvedValueOnce(1);

    const library = createTrustedDeviceLibrary(tenantId, queries, { isProduction: false });

    await expect(library.validateCredential(ctx, userId)).resolves.toBeUndefined();
    await Promise.resolve();

    expect(queries.deleteExpiredByIdAndUserId).toHaveBeenCalledWith(trustedDeviceId, userId);
    expect(set).toHaveBeenCalledTimes(1);
  });

  it('deduplicates concurrent opportunistic cleanup within the cooldown', async () => {
    const queries = createQueries();
    queries.deleteExpiredByTenant.mockResolvedValue(2);
    const library = createTrustedDeviceLibrary(tenantId, queries, {
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
    const library = createTrustedDeviceLibrary(tenantId, queries, {
      isProduction: false,
      cleanupCooldown: 60_000,
    });

    await expect(library.cleanupExpired()).resolves.toBeUndefined();
    await expect(library.cleanupExpired()).resolves.toBe(2);
    expect(queries.deleteExpiredByTenant).toHaveBeenCalledTimes(2);
  });
});
