import { OidcSigningKeyStatus } from '@logto/schemas';

import Queries from '#src/tenants/Queries.js';
import { createMockCommonQueryMethods } from '#src/test-utils/query.js';
import { MockWellKnownCache } from '#src/test-utils/tenant.js';

import {
  OidcPrivateKeyLibrary,
  getCanonicalOidcPrivateKeys,
  getCurrentOidcPrivateKey,
  getImmediatelyRotatedOidcPrivateKeys,
  getOidcPrivateKeysAfterDeletion,
  getOidcProviderPrivateKeys,
  getStagedRotatedOidcPrivateKeys,
  normalizeOidcPrivateKeys,
  rotateOidcPrivateKeyStatuses,
} from './oidc-private-key.js';

const { jest } = import.meta;

const createPrivateKey = (id: string, createdAt: number, status?: OidcSigningKeyStatus) => ({
  id,
  value: `private-key-${id}`,
  createdAt,
  status,
});

describe('normalizeOidcPrivateKeys', () => {
  it('normalizes legacy private keys without status into Current and Previous', () => {
    const result = normalizeOidcPrivateKeys([
      createPrivateKey('current', 1),
      createPrivateKey('previous', 2),
    ]);

    expect(result).toEqual([
      createPrivateKey('current', 1, OidcSigningKeyStatus.Current),
      createPrivateKey('previous', 2, OidcSigningKeyStatus.Previous),
    ]);
  });

  it('preserves explicit statuses without reordering the input array', () => {
    const result = normalizeOidcPrivateKeys([
      createPrivateKey('previous', 3, OidcSigningKeyStatus.Previous),
      createPrivateKey('current', 2, OidcSigningKeyStatus.Current),
      createPrivateKey('next', 1, OidcSigningKeyStatus.Next),
    ]);

    expect(result).toEqual([
      createPrivateKey('previous', 3, OidcSigningKeyStatus.Previous),
      createPrivateKey('current', 2, OidcSigningKeyStatus.Current),
      createPrivateKey('next', 1, OidcSigningKeyStatus.Next),
    ]);
  });

  it('throws for malformed status configurations', () => {
    expect(() =>
      normalizeOidcPrivateKeys([
        createPrivateKey('current-a', 1, OidcSigningKeyStatus.Current),
        createPrivateKey('current-b', 2, OidcSigningKeyStatus.Current),
      ])
    ).toThrow('Malformed OIDC private key status configuration');
  });
});

describe('getCanonicalOidcPrivateKeys', () => {
  it('orders private keys as Next, Current, Previous in canonical status order', () => {
    const result = getCanonicalOidcPrivateKeys([
      createPrivateKey('previous', 3, OidcSigningKeyStatus.Previous),
      createPrivateKey('current', 2, OidcSigningKeyStatus.Current),
      createPrivateKey('next', 1, OidcSigningKeyStatus.Next),
    ]);

    expect(result).toEqual([
      createPrivateKey('next', 1, OidcSigningKeyStatus.Next),
      createPrivateKey('current', 2, OidcSigningKeyStatus.Current),
      createPrivateKey('previous', 3, OidcSigningKeyStatus.Previous),
    ]);
  });
});

describe('getCurrentOidcPrivateKey', () => {
  it('finds the Current signing key by status instead of array index', () => {
    const result = getCurrentOidcPrivateKey([
      createPrivateKey('previous', 3, OidcSigningKeyStatus.Previous),
      createPrivateKey('current', 2, OidcSigningKeyStatus.Current),
      createPrivateKey('next', 1, OidcSigningKeyStatus.Next),
    ]);

    expect(result).toEqual(createPrivateKey('current', 2, OidcSigningKeyStatus.Current));
  });
});

describe('getOidcProviderPrivateKeys', () => {
  it('orders private keys as Current, Next, Previous for oidc-provider consumption', () => {
    const result = getOidcProviderPrivateKeys([
      createPrivateKey('previous', 3, OidcSigningKeyStatus.Previous),
      createPrivateKey('current', 2, OidcSigningKeyStatus.Current),
      createPrivateKey('next', 1, OidcSigningKeyStatus.Next),
    ]);

    expect(result).toEqual([
      createPrivateKey('current', 2, OidcSigningKeyStatus.Current),
      createPrivateKey('next', 1, OidcSigningKeyStatus.Next),
      createPrivateKey('previous', 3, OidcSigningKeyStatus.Previous),
    ]);
  });
});

describe('getImmediatelyRotatedOidcPrivateKeys', () => {
  it('persists the new key as Current and demotes the previous Current to Previous', () => {
    const result = getImmediatelyRotatedOidcPrivateKeys(
      [
        createPrivateKey('current', 2, OidcSigningKeyStatus.Current),
        createPrivateKey('previous', 1, OidcSigningKeyStatus.Previous),
      ],
      createPrivateKey('new', 3)
    );

    expect(result).toEqual([
      createPrivateKey('new', 3, OidcSigningKeyStatus.Current),
      createPrivateKey('current', 2, OidcSigningKeyStatus.Previous),
    ]);
  });
});

describe('getStagedRotatedOidcPrivateKeys', () => {
  it('persists the new key as Next while preserving Current and Previous', () => {
    const result = getStagedRotatedOidcPrivateKeys(
      [
        createPrivateKey('current', 2, OidcSigningKeyStatus.Current),
        createPrivateKey('previous', 1, OidcSigningKeyStatus.Previous),
      ],
      createPrivateKey('new', 3)
    );

    expect(result).toEqual([
      createPrivateKey('new', 3, OidcSigningKeyStatus.Next),
      createPrivateKey('current', 2, OidcSigningKeyStatus.Current),
      createPrivateKey('previous', 1, OidcSigningKeyStatus.Previous),
    ]);
  });

  it('replaces any existing Next key instead of accumulating a fourth private key', () => {
    const result = getStagedRotatedOidcPrivateKeys(
      [
        createPrivateKey('next', 4, OidcSigningKeyStatus.Next),
        createPrivateKey('current', 3, OidcSigningKeyStatus.Current),
        createPrivateKey('previous', 2, OidcSigningKeyStatus.Previous),
      ],
      createPrivateKey('replacement', 5)
    );

    expect(result).toEqual([
      createPrivateKey('replacement', 5, OidcSigningKeyStatus.Next),
      createPrivateKey('current', 3, OidcSigningKeyStatus.Current),
      createPrivateKey('previous', 2, OidcSigningKeyStatus.Previous),
    ]);
  });
});

describe('rotateOidcPrivateKeyStatuses', () => {
  it('promotes Next to Current and demotes Current to Previous', () => {
    const result = rotateOidcPrivateKeyStatuses([
      createPrivateKey('next', 3, OidcSigningKeyStatus.Next),
      createPrivateKey('current', 2, OidcSigningKeyStatus.Current),
      createPrivateKey('previous', 1, OidcSigningKeyStatus.Previous),
    ]);

    expect(result).toEqual([
      createPrivateKey('next', 3, OidcSigningKeyStatus.Current),
      createPrivateKey('current', 2, OidcSigningKeyStatus.Previous),
    ]);
  });

  it('returns the original normalized keys when there is no staged Next key', () => {
    const privateKeys = [
      createPrivateKey('current', 2, OidcSigningKeyStatus.Current),
      createPrivateKey('previous', 1, OidcSigningKeyStatus.Previous),
    ];

    expect(rotateOidcPrivateKeyStatuses(privateKeys)).toBe(privateKeys);
  });
});

describe('getOidcPrivateKeysAfterDeletion', () => {
  it('promotes the remaining key to Current after deleting Previous from the immediate flow', () => {
    const result = getOidcPrivateKeysAfterDeletion(
      [
        createPrivateKey('current', 2, OidcSigningKeyStatus.Current),
        createPrivateKey('previous', 1, OidcSigningKeyStatus.Previous),
      ],
      'previous'
    );

    expect(result).toEqual([createPrivateKey('current', 2, OidcSigningKeyStatus.Current)]);
  });

  it('preserves Next and Current statuses when deleting Previous from a staged key set', () => {
    const result = getOidcPrivateKeysAfterDeletion(
      [
        createPrivateKey('next', 3, OidcSigningKeyStatus.Next),
        createPrivateKey('current', 2, OidcSigningKeyStatus.Current),
        createPrivateKey('previous', 1, OidcSigningKeyStatus.Previous),
      ],
      'previous'
    );

    expect(result).toEqual([
      createPrivateKey('next', 3, OidcSigningKeyStatus.Next),
      createPrivateKey('current', 2, OidcSigningKeyStatus.Current),
    ]);
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
    methods.one
      .mockResolvedValueOnce({
        key: 'oidc.privateKeys',
        value: [
          createPrivateKey('new', 3, OidcSigningKeyStatus.Current),
          createPrivateKey('current', 2, OidcSigningKeyStatus.Previous),
        ],
      } as never)
      .mockResolvedValueOnce({
        value: { tenantCacheExpiresAt: 123 },
      } as never);

    const result = await library.rotatePrivateSigningKeys(createPrivateKey('new', 3), 0);

    expect(methods.transaction).toHaveBeenCalledTimes(1);
    expect(methods.query).toHaveBeenCalledTimes(2);
    expect(methods.one).toHaveBeenCalledTimes(2);
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
            value: { tenantCacheExpiresAt: 1, signingKeyRotationAt: 2 },
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
        value: { tenantCacheExpiresAt: 123, signingKeyRotationAt: 456 },
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
