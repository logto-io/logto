/**
 * The mocked `systems` table, license public key and usage collection the `LicenseReader` tests
 * share. Import it before anything that loads `./LicenseReader.js`, so the mocks are in place.
 */
import { LicenseKey, type LicenseUsage } from '@logto/schemas';
import { createMockUtils, pickDefault } from '@logto/shared/esm';
import { noop } from '@silverhand/essentials';
import { createMockPool } from '@silverhand/slonik';
import { type CryptoKey, importJWK } from 'jose';
import nock from 'nock';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import { createLicenseKeyPair } from '#src/test-utils/license.js';

import { licenseConsoleLog } from './console.js';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

export const pool = createMockPool({ query: jest.fn() });

// `maybeOne` resolves to `null` when the row is absent.
export const findSystemByKey = jest.fn(async (_key: string): Promise<unknown> => null);
export const upsertSystem = jest.fn(async (key: string, value: unknown) => ({ key, value }));
mockEsm('#src/queries/system.js', () => ({
  createSystemsQuery: () => ({
    findSystemByKey,
    findSystemByKeyForUpdate: findSystemByKey,
    upsertSystem,
  }),
}));

export const error = jest.spyOn(licenseConsoleLog, 'error').mockImplementation(noop);

export const keyPair = await createLicenseKeyPair();

const es256PublicKeyGuard = z.object({
  kty: z.literal('EC'),
  crv: z.literal('P-256'),
  x: z.string(),
  y: z.string(),
});

/** The public key the mocked build trusts, so a test can sign licenses this instance accepts. */
const trustedKey = await importJWK(
  es256PublicKeyGuard.parse(JSON.parse(keyPair.publicKey)),
  'ES256'
);
const getLicensePublicKey: () => Promise<CryptoKey | Uint8Array> = async () => trustedKey;
mockEsm('./public-key.js', () => ({ getLicensePublicKey }));

export const usage = {
  month: '2026-10',
  mau: { lastMonth: 120, monthToDate: 40 },
  monthlyAccessTokens: { lastMonth: 9000, monthToDate: 3000 },
  tenants: 2,
} satisfies LicenseUsage;
export const collectLicenseUsage = jest.fn(async (): Promise<LicenseUsage | undefined> => usage);
mockEsm('./usage.js', () => ({ collectLicenseUsage }));

export const LicenseReader = await pickDefault(import('./LicenseReader.js'));
export const { licenseRefreshTimeout, selfHostedLicenseServiceUrl } = await import(
  './LicenseReader.js'
);

export const installedAt = '2026-09-14T00:00:00.000Z';

export const waitFor = async (condition: () => boolean, attempts = 100): Promise<void> => {
  if (condition()) {
    return;
  }

  if (attempts === 0) {
    throw new Error('Timed out waiting for the license refresh.');
  }

  await new Promise((resolve) => {
    setTimeout(resolve, 5);
  });
  return waitFor(condition, attempts - 1);
};

/** The refresh state a refused refresh wrote, if any. */
export const findRefusal = () =>
  upsertSystem.mock.calls.find(
    ([key, value]) =>
      key === LicenseKey.LicenseRefreshState &&
      typeof value === 'object' &&
      value !== null &&
      'refusalReason' in value
  );

/** Put a license key into the `systems` table, as `PUT /api/systems/license` does. */
export const install = (jwt: string) => {
  findSystemByKey.mockImplementation(async (key) =>
    key === LicenseKey.License ? { value: { jwt, installedAt } } : null
  );
};

/**
 * Create a reader for a test suite, and reset it, the mocks and the environment values the tests
 * change after each test.
 */
export const setUpReader = () => {
  const reader = new LicenseReader();
  const { isDevFeaturesEnabled, isProduction, isIntegrationTest, isLicenseUsageReportingDisabled } =
    EnvSet.values;

  afterEach(() => {
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', isDevFeaturesEnabled);
    Reflect.set(EnvSet.values, 'isLicenseUsageReportingDisabled', isLicenseUsageReportingDisabled);
    Reflect.set(EnvSet.values, 'isProduction', isProduction);
    Reflect.set(EnvSet.values, 'isIntegrationTest', isIntegrationTest);
    jest.clearAllMocks();
    nock.cleanAll();
    findSystemByKey.mockReset();
    findSystemByKey.mockResolvedValue(null);
    upsertSystem.mockReset();
    reader.invalidate();
  });

  return reader;
};
