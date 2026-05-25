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

const createPrivateKey = (id: string, status: OidcSigningKeyStatus, createdAt = Date.now()) => {
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
    createdAt,
    status,
  };
};

const getPublicJwk = async ({ value }: ReturnType<typeof createPrivateKey>) =>
  exportJWK(createPublicKey(value));

const setEnvValues = ({
  isCloud = false,
  adminUrlSet = createAdminUrlSet(),
}: {
  isCloud?: boolean;
  adminUrlSet?: ReturnType<typeof createAdminUrlSet>;
} = {}) =>
  Sinon.stub(EnvSet, 'values').value({
    ...EnvSet.values,
    isCloud,
    isMultiTenancy: false,
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
    Sinon.restore();
  });

  it('reads admin tenant signing keys from database in OSS without calling OIDC endpoints', async () => {
    setEnvValues();
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
      issuer: ['https://admin.example.com/oidc'],
    });
  });

  it('keeps using remote OIDC discovery and JWKS in Cloud', async () => {
    setEnvValues({ isCloud: true });
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
      issuer: ['https://admin.example.com/oidc'],
    });
  });

  it('returns Current, Next, and Previous public keys from the OSS database path', async () => {
    setEnvValues();
    const currentKey = createPrivateKey('current', OidcSigningKeyStatus.Current, 1);
    const nextKey = createPrivateKey('next', OidcSigningKeyStatus.Next, 2);
    const previousKey = createPrivateKey('previous', OidcSigningKeyStatus.Previous, 3);
    methods.one.mockResolvedValueOnce({
      value: [previousKey, nextKey, currentKey],
    } as never);

    const result = await getAdminTenantTokenValidationSet();
    const expectedKeys = await Promise.all(
      [currentKey, nextKey, previousKey].map(async (key) => getPublicJwk(key))
    );

    expect(result.keys).toEqual(expectedKeys);
  });

  it('does not cache OSS database keys between calls', async () => {
    setEnvValues();
    const firstKey = createPrivateKey('first', OidcSigningKeyStatus.Current, 1);
    const secondKey = createPrivateKey('second', OidcSigningKeyStatus.Current, 2);
    methods.one
      .mockResolvedValueOnce({
        value: [firstKey],
      } as never)
      .mockResolvedValueOnce({
        value: [secondKey],
      } as never);

    const firstResult = await getAdminTenantTokenValidationSet();
    const secondResult = await getAdminTenantTokenValidationSet();

    expect(methods.one).toHaveBeenCalledTimes(2);
    expect(firstResult.keys).toEqual([await getPublicJwk(firstKey)]);
    expect(secondResult.keys).toEqual([await getPublicJwk(secondKey)]);
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
