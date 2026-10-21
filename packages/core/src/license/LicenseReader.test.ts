import { ossDefaultQuota } from '@logto/schemas';

import { EnvSet } from '#src/env-set/index.js';
import { buildLicensePayload, signLicenseKey } from '#src/test-utils/license.js';

import {
  LicenseReader,
  error,
  findSystemByKey,
  install,
  installedAt,
  keyPair,
  pool,
  setUpReader,
} from './LicenseReader.test-utils.js';

const { jest } = import.meta;

describe('LicenseReader', () => {
  const reader = setUpReader();

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
      lastRefreshedAt: new Date(payload.iat * 1000).toISOString(),
      graceEndsAt: new Date(payload.iat * 1000 + 30 * 24 * 60 * 60 * 1000).toISOString(),
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
    expect(findSystemByKey).toHaveBeenCalledTimes(3);

    reader.invalidate();
    await reader.read(pool);
    expect(findSystemByKey).toHaveBeenCalledTimes(6);
  });

  it('should not cache a failed database read', async () => {
    findSystemByKey.mockRejectedValueOnce(new Error('Connection terminated'));

    await expect(reader.read(pool)).rejects.toThrow('Connection terminated');
    await expect(reader.read(pool)).resolves.toBeUndefined();
    expect(findSystemByKey).toHaveBeenCalledTimes(6);
  });

  it('should read licensed entitlements without dev features', async () => {
    const payload = buildLicensePayload({ quota: { bringYourUi: true } });
    install(await signLicenseKey(payload, keyPair.privateKey));
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', false);

    await expect(reader.read(pool)).resolves.toMatchObject({
      payload,
      quota: { ...ossDefaultQuota, bringYourUi: true },
    });
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
    expect(findSystemByKey).toHaveBeenCalledTimes(3);

    now.mockReturnValue(startedAt + 30_000);
    await expect(reader.read(pool)).resolves.toBeDefined();
    expect(findSystemByKey).toHaveBeenCalledTimes(3);

    // Another instance removed the license; `invalidate()` there never reached this process.
    now.mockReturnValue(startedAt + 60_001);
    findSystemByKey.mockResolvedValue(null);

    await expect(reader.read(pool)).resolves.toBeUndefined();
    expect(findSystemByKey).toHaveBeenCalledTimes(6);
  });
});
