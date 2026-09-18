import { createPublicKey, generateKeyPairSync } from 'node:crypto';

import { OidcSigningKeyStatus } from '@logto/schemas';

import Queries from '#src/tenants/Queries.js';
import { createMockCommonQueryMethods } from '#src/test-utils/query.js';
import { MockWellKnownCache } from '#src/test-utils/tenant.js';
import { exportJWK } from '#src/utils/jwks.js';

import { OidcPrivateKeyLibrary, getOidcProviderPublicJwks } from './oidc-private-key.js';

const { jest } = import.meta;

const createPrivateKey = (id: string, createdAt: number, status?: OidcSigningKeyStatus) => ({
  id,
  value: `private-key-${id}`,
  createdAt,
  status,
});

const createPemPrivateKey = (id: string, status: OidcSigningKeyStatus) => {
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

describe('getOidcProviderPublicJwks', () => {
  it('exports public JWKS in oidc-provider key order', async () => {
    const currentKey = createPemPrivateKey('current', OidcSigningKeyStatus.Current);
    const nextKey = createPemPrivateKey('next', OidcSigningKeyStatus.Next);
    const previousKey = createPemPrivateKey('previous', OidcSigningKeyStatus.Previous);
    const expectedKeys = await Promise.all(
      [currentKey, nextKey, previousKey].map(async ({ value }) => exportJWK(createPublicKey(value)))
    );

    await expect(getOidcProviderPublicJwks([previousKey, nextKey, currentKey])).resolves.toEqual(
      expectedKeys
    );
  });
});

describe('OidcPrivateKeyLibrary', () => {
  const methods = createMockCommonQueryMethods();
  const queries = new Queries(methods as never, new MockWellKnownCache());
  const library = new OidcPrivateKeyLibrary(queries);

  beforeEach(() => {
    jest.clearAllMocks();
    methods.transaction.mockImplementation(
      async (handler: (transaction: typeof methods) => Promise<unknown>) => handler(methods)
    );
  });

  it('rotates private signing keys immediately inside a locked transaction', async () => {
    methods.query.mockResolvedValueOnce({ rows: [] } as never).mockResolvedValueOnce({
      rows: [
        {
          key: 'oidc.privateKeys',
          value: [createPrivateKey('current', 2, OidcSigningKeyStatus.Current)],
        },
      ],
    } as never);
    methods.one.mockResolvedValueOnce({
      key: 'oidc.privateKeys',
      value: [
        createPrivateKey('new', 3, OidcSigningKeyStatus.Current),
        createPrivateKey('current', 2, OidcSigningKeyStatus.Previous),
      ],
    } as never);

    const result = await library.rotatePrivateSigningKeys(createPrivateKey('new', 3), 0);

    expect(methods.transaction).toHaveBeenCalledTimes(1);
    expect(methods.query).toHaveBeenCalledTimes(2);
    expect(methods.one).toHaveBeenCalledTimes(1);
    expect(result).toEqual([
      createPrivateKey('new', 3, OidcSigningKeyStatus.Current),
      createPrivateKey('current', 2, OidcSigningKeyStatus.Previous),
    ]);
  });

  it('stages private signing key rotation inside a locked transaction', async () => {
    methods.query
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({
        rows: [
          {
            key: 'oidc.privateKeys',
            value: [
              createPrivateKey('current', 2, OidcSigningKeyStatus.Current),
              createPrivateKey('previous', 1, OidcSigningKeyStatus.Previous),
            ],
          },
        ],
      } as never)
      .mockResolvedValueOnce({
        rows: [
          {
            key: 'signingKeyRotationState',
            value: { signingKeyRotationAt: 2 },
          },
        ],
      } as never);
    methods.one
      .mockResolvedValueOnce({
        key: 'oidc.privateKeys',
        value: [
          createPrivateKey('new', 3, OidcSigningKeyStatus.Next),
          createPrivateKey('current', 2, OidcSigningKeyStatus.Current),
          createPrivateKey('previous', 1, OidcSigningKeyStatus.Previous),
        ],
      } as never)
      .mockResolvedValueOnce({
        value: { signingKeyRotationAt: 456 },
      } as never);

    const result = await library.rotatePrivateSigningKeys(createPrivateKey('new', 3), 60);

    expect(methods.transaction).toHaveBeenCalledTimes(1);
    expect(methods.query).toHaveBeenCalledTimes(3);
    expect(methods.one).toHaveBeenCalledTimes(2);
    expect(result).toEqual([
      createPrivateKey('new', 3, OidcSigningKeyStatus.Next),
      createPrivateKey('current', 2, OidcSigningKeyStatus.Current),
      createPrivateKey('previous', 1, OidcSigningKeyStatus.Previous),
    ]);
  });

  it('rejects deletion when private signing keys would become empty', async () => {
    methods.query.mockResolvedValueOnce({ rows: [] } as never).mockResolvedValueOnce({
      rows: [
        {
          key: 'oidc.privateKeys',
          value: [createPrivateKey('current', 2, OidcSigningKeyStatus.Current)],
        },
      ],
    } as never);

    await expect(library.deletePrivateSigningKey('current')).rejects.toMatchObject({
      code: 'oidc.key_required',
      status: 422,
    });
    expect(methods.one).not.toHaveBeenCalled();
  });
});
