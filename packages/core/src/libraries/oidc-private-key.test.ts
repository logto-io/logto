import { OidcSigningKeyStatus } from '@logto/schemas';

import {
  getCanonicalOidcPrivateKeys,
  getCurrentOidcPrivateKey,
  getImmediatelyRotatedOidcPrivateKeys,
  getOidcPrivateKeysAfterDeletion,
  getOidcProviderPrivateKeys,
  normalizeOidcPrivateKeys,
} from './oidc-private-key.js';

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
});
