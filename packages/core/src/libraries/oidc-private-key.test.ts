import { OidcSigningKeyStatus } from '@logto/schemas';

import { normalizeOidcPrivateKeys } from './oidc-private-key.js';

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

  it('sorts explicit statuses into Next, Current, Previous order', () => {
    const result = normalizeOidcPrivateKeys([
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

  it('throws for malformed status configurations', () => {
    expect(() =>
      normalizeOidcPrivateKeys([
        createPrivateKey('current-a', 1, OidcSigningKeyStatus.Current),
        createPrivateKey('current-b', 2, OidcSigningKeyStatus.Current),
      ])
    ).toThrow('Malformed OIDC private key status configuration');
  });
});
