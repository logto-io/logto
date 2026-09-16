import { LicenseKey, ossDefaultQuota } from '@logto/schemas';
import { createMockUtils, pickDefault } from '@logto/shared/esm';
import { noop } from '@silverhand/essentials';
import { createMockPool } from '@silverhand/slonik';
import { type CryptoKey, type JWK, importJWK } from 'jose';

import { EnvSet } from '#src/env-set/index.js';
import {
  buildLicensePayload,
  createLicenseKeyPair,
  signLicenseKey,
} from '#src/test-utils/license.js';

import { licenseConsoleLog } from './console.js';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

const pool = createMockPool({ query: jest.fn() });

// `maybeOne` resolves to `null` when the row is absent.
const findSystemByKey = jest.fn(async (_key: string): Promise<unknown> => null);
mockEsm('#src/queries/system.js', () => ({
  createSystemsQuery: () => ({ findSystemByKey }),
}));

const error = jest.spyOn(licenseConsoleLog, 'error').mockImplementation(noop);

const keyPair = await createLicenseKeyPair();

/** The public key the mocked build trusts, so a test can sign licenses this instance accepts. */
const trustedKey = await importJWK(JSON.parse(keyPair.publicKey) as JWK, 'EdDSA');
const getLicensePublicKey: () => Promise<CryptoKey | Uint8Array> = async () => trustedKey;
mockEsm('./public-key.js', () => ({ getLicensePublicKey }));

const LicenseReader = await pickDefault(import('./LicenseReader.js'));

const installedAt = '2026-09-14T00:00:00.000Z';

/** Put a license key into the `systems` table, as `PUT /api/systems/license` does. */
const install = (jwt: string) => {
  findSystemByKey.mockImplementation(async (key) =>
    key === LicenseKey.License ? { value: { jwt, installedAt } } : null
  );
};

describe('LicenseReader', () => {
  const reader = new LicenseReader();
  const { isDevFeaturesEnabled } = EnvSet.values;

  afterEach(() => {
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', isDevFeaturesEnabled);
    jest.clearAllMocks();
    findSystemByKey.mockReset();
    findSystemByKey.mockResolvedValue(null);
    reader.invalidate();
  });

  it('should share one reader across the process', () => {
    expect(LicenseReader.shared).toBeInstanceOf(LicenseReader);
  });

  it('should read no license when none is installed', async () => {
    await expect(reader.read(pool)).resolves.toBeUndefined();
  });

  it('should read an installed license and fill the self-hosted defaults in', async () => {
    const payload = buildLicensePayload({
      quota: { hideLogtoBranding: true, samlApplicationsLimit: null },
    });
    install(await signLicenseKey(payload, keyPair.privateKey));

    await expect(reader.read(pool)).resolves.toEqual({
      payload,
      installedAt,
      quota: {
        ...ossDefaultQuota,
        hideLogtoBranding: true,
        samlApplicationsLimit: null,
      },
    });
  });

  it('should ignore a stored value that is not an installed license', async () => {
    findSystemByKey.mockResolvedValue({ value: { jwt: 42 } });

    await expect(reader.read(pool)).resolves.toBeUndefined();
    expect(error).toHaveBeenCalledTimes(1);
  });

  it('should ignore a license key that does not verify, rather than fail the request', async () => {
    install('not-a-license-key');

    await expect(reader.read(pool)).resolves.toBeUndefined();
    expect(error).toHaveBeenCalledTimes(1);
  });

  it('should read the database once until it is invalidated', async () => {
    install(await signLicenseKey(buildLicensePayload(), keyPair.privateKey));

    await Promise.all([reader.read(pool), reader.read(pool)]);
    await reader.read(pool);
    expect(findSystemByKey).toHaveBeenCalledTimes(1);

    reader.invalidate();
    await reader.read(pool);
    expect(findSystemByKey).toHaveBeenCalledTimes(2);
  });

  it('should not cache a failed database read', async () => {
    findSystemByKey.mockRejectedValueOnce(new Error('Connection terminated'));

    await expect(reader.read(pool)).rejects.toThrow('Connection terminated');
    await expect(reader.read(pool)).resolves.toBeUndefined();
    expect(findSystemByKey).toHaveBeenCalledTimes(2);
  });

  it('should grant nothing while the self-hosted plans feature is not launched', async () => {
    install(await signLicenseKey(buildLicensePayload(), keyPair.privateKey));
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', false);

    await expect(reader.read(pool)).resolves.toBeUndefined();
    expect(findSystemByKey).not.toHaveBeenCalled();
  });
});

describe('LicenseReader cache expiry', () => {
  const reader = new LicenseReader();
  const startedAt = Date.now();

  /**
   * The cache only reads the clock, so moving `Date.now` is enough — and it leaves the timers
   * alone, which the asynchronous signing and verification below run on.
   */
  const now = jest.spyOn(Date, 'now');

  beforeEach(() => {
    now.mockReturnValue(startedAt);
  });

  afterEach(() => {
    jest.clearAllMocks();
    findSystemByKey.mockReset();
    findSystemByKey.mockResolvedValue(null);
    reader.invalidate();
  });

  // `mockReset()` would leave `Date.now` answering `undefined`; hand the real clock back instead.
  afterAll(() => {
    now.mockRestore();
  });

  it('should expire the cache, so an instance that handled no write still sees a change', async () => {
    install(await signLicenseKey(buildLicensePayload(), keyPair.privateKey));

    await expect(reader.read(pool)).resolves.toBeDefined();
    expect(findSystemByKey).toHaveBeenCalledTimes(1);

    now.mockReturnValue(startedAt + 30_000);
    await expect(reader.read(pool)).resolves.toBeDefined();
    expect(findSystemByKey).toHaveBeenCalledTimes(1);

    // Another instance removed the license; `invalidate()` there never reached this process.
    now.mockReturnValue(startedAt + 60_001);
    findSystemByKey.mockResolvedValue(null);

    await expect(reader.read(pool)).resolves.toBeUndefined();
    expect(findSystemByKey).toHaveBeenCalledTimes(2);
  });
});
