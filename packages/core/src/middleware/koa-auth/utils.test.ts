import { createPublicKey, generateKeyPairSync } from 'node:crypto';

import { OidcSigningKeyStatus } from '@logto/schemas';
import { createMockUtils } from '@logto/shared/esm';
import type { JWK } from 'jose';
import Sinon from 'sinon';

import { EnvSet } from '#src/env-set/index.js';
import { createMockCommonQueryMethods, expectSqlString } from '#src/test-utils/query.js';
import { exportJWK } from '#src/utils/jwks.js';

const { jest } = import.meta;
const { mockEsmDefault } = createMockUtils(jest);

const ky = mockEsmDefault('ky', () => ({
  get: jest.fn(),
}));

const { getAdminTenantTokenValidationSet } = await import('./utils.js');

const createAdminUrlSet = (endpoint = 'https://admin.example.com') => ({
  endpoint: new URL(endpoint),
  deduplicated: jest.fn(() => [new URL(endpoint)]),
});

const createPrivateKey = (id: string, status: OidcSigningKeyStatus) => {
  const { privateKey } = generateKeyPairSync('ec', {
    namedCurve: 'P-384',
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
  });

  return {
    id,
    value: privateKey,
    createdAt: Date.now(),
    status,
  };
};

const getPublicJwk = async ({ value }: ReturnType<typeof createPrivateKey>) =>
  exportJWK(createPublicKey(value));

const setEnvValues = ({
  isCloud = false,
  isMultiTenancy = false,
  adminUrlSet = createAdminUrlSet(),
}: {
  isCloud?: boolean;
  isMultiTenancy?: boolean;
  adminUrlSet?: ReturnType<typeof createAdminUrlSet>;
} = {}) =>
  Sinon.stub(EnvSet, 'values').value({
    ...EnvSet.values,
    isCloud,
    isMultiTenancy,
    adminUrlSet,
  });

describe('getAdminTenantTokenValidationSet', () => {
  const methods = createMockCommonQueryMethods();

  beforeEach(() => {
    jest.clearAllMocks();
    methods.one.mockReset();
    Sinon.stub(EnvSet, 'sharedPool').value(Promise.resolve(methods));
  });

  afterEach(() => {
    jest.useRealTimers();
    Sinon.restore();
  });

  it('reads keys from DB in OSS, skips OIDC discovery', async () => {
    setEnvValues({ adminUrlSet: createAdminUrlSet('https://db.example.com') });
    const privateKey = createPrivateKey('current', OidcSigningKeyStatus.Current);
    methods.one.mockResolvedValueOnce({
      value: [privateKey],
    } as never);

    const result = await getAdminTenantTokenValidationSet();
    const expectedJwk = await getPublicJwk(privateKey);

    expect(ky.get).not.toHaveBeenCalled();
    expect(methods.one).toHaveBeenCalledWith(expectSqlString('from "logto_configs"'));
    expect(methods.one).toHaveBeenCalledWith(expectSqlString('and "key" = $'));
    expect(result).toEqual({
      keys: [expectedJwk],
      issuer: ['https://db.example.com/oidc'],
    });
  });

  it('keeps using remote OIDC discovery and JWKS in Cloud', async () => {
    setEnvValues({ isCloud: true, adminUrlSet: createAdminUrlSet('https://cloud.example.com') });
    const cloudJwk: JWK = { kty: 'EC', kid: 'cloud-key' };
    ky.get
      .mockReturnValueOnce({
        json: jest.fn(async () => ({
          jwks_uri: 'https://admin.example.com/oidc/jwks',
        })),
      })
      .mockReturnValueOnce({
        json: jest.fn(async () => ({
          keys: [cloudJwk],
        })),
      });

    const result = await getAdminTenantTokenValidationSet();

    expect(methods.one).not.toHaveBeenCalled();
    expect(ky.get).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      keys: [cloudJwk],
      issuer: ['https://cloud.example.com/oidc'],
    });
  });

  it('returns Current/Next/Previous in oidc-provider order', async () => {
    setEnvValues({ adminUrlSet: createAdminUrlSet('https://order.example.com') });
    const currentKey = createPrivateKey('current', OidcSigningKeyStatus.Current);
    const nextKey = createPrivateKey('next', OidcSigningKeyStatus.Next);
    const previousKey = createPrivateKey('previous', OidcSigningKeyStatus.Previous);
    methods.one.mockResolvedValueOnce({
      value: [previousKey, nextKey, currentKey],
    } as never);

    const result = await getAdminTenantTokenValidationSet();
    const expectedKeys = await Promise.all(
      [currentKey, nextKey, previousKey].map(async (key) => getPublicJwk(key))
    );

    expect(result.keys).toEqual(expectedKeys);
  });

  it('caches OSS public JWKS with the shared JWKS TTL', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(0);
    setEnvValues({ adminUrlSet: createAdminUrlSet('https://cache.example.com') });
    const firstKey = createPrivateKey('first', OidcSigningKeyStatus.Current);
    const secondKey = createPrivateKey('second', OidcSigningKeyStatus.Current);
    methods.one
      .mockResolvedValueOnce({
        value: [firstKey],
      } as never)
      .mockResolvedValueOnce({
        value: [secondKey],
      } as never);

    const firstResult = await getAdminTenantTokenValidationSet();
    const secondResult = await getAdminTenantTokenValidationSet();

    expect(methods.one).toHaveBeenCalledTimes(1);
    expect(firstResult.keys).toEqual([await getPublicJwk(firstKey)]);
    expect(secondResult.keys).toEqual([await getPublicJwk(firstKey)]);

    jest.advanceTimersByTime(60 * 60 * 1000 + 1);

    const thirdResult = await getAdminTenantTokenValidationSet();

    expect(methods.one).toHaveBeenCalledTimes(2);
    expect(thirdResult.keys).toEqual([await getPublicJwk(secondKey)]);
  });

  it('returns empty keys with issuer when OSS private keys are empty', async () => {
    setEnvValues({ adminUrlSet: createAdminUrlSet('https://empty.example.com') });
    methods.one.mockResolvedValueOnce({
      value: [],
    } as never);

    await expect(getAdminTenantTokenValidationSet()).resolves.toEqual({
      keys: [],
      issuer: ['https://empty.example.com/oidc'],
    });
  });

  it('throws when OSS private keys are malformed', async () => {
    setEnvValues({ adminUrlSet: createAdminUrlSet('https://malformed.example.com') });
    methods.one.mockResolvedValueOnce({
      value: [{ id: 'malformed' }],
    } as never);

    await expect(getAdminTenantTokenValidationSet()).rejects.toThrow();
  });

  it('derives issuer via getTenantEndpoint in multi-tenancy', async () => {
    setEnvValues({
      isMultiTenancy: true,
      adminUrlSet: createAdminUrlSet('https://multi.example.com'),
    });
    const privateKey = createPrivateKey('current', OidcSigningKeyStatus.Current);
    methods.one.mockResolvedValueOnce({
      value: [privateKey],
    } as never);

    const result = await getAdminTenantTokenValidationSet();

    expect(result.issuer).toEqual(['https://multi.example.com/oidc']);
  });

  it('returns an empty set when admin tenant validation is unnecessary', async () => {
    setEnvValues({
      adminUrlSet: {
        endpoint: new URL('https://admin.example.com'),
        deduplicated: jest.fn(() => []),
      },
    });

    await expect(getAdminTenantTokenValidationSet()).resolves.toEqual({
      keys: [],
      issuer: [],
    });
    expect(methods.one).not.toHaveBeenCalled();
    expect(ky.get).not.toHaveBeenCalled();
  });
});
