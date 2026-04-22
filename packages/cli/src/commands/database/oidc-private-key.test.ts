import { OidcSigningKeyStatus, type OidcPrivateKey } from '@logto/schemas';
import { describe, expect, it } from 'vitest';

import {
  getImmediatelyRotatedOidcPrivateKeys,
  getRotationStateForCacheInvalidation,
  getRotationStateForStagedRotation,
  getSeededOidcPrivateKeys,
  getStagedRotatedOidcPrivateKeys,
  getTrimmedOidcPrivateKeys,
  normalizeOidcPrivateKeys,
} from './oidc-private-key.js';

const createPrivateKey = (
  id: string,
  createdAt: number,
  status?: OidcSigningKeyStatus
): OidcPrivateKey => ({
  id,
  value: `private-key-${id}`,
  createdAt,
  ...(status ? { status } : {}),
});

describe('normalizeOidcPrivateKeys', () => {
  it('normalizes legacy private keys into explicit statuses', () => {
    expect(
      normalizeOidcPrivateKeys([createPrivateKey('current', 2), createPrivateKey('previous', 1)])
    ).toEqual([
      createPrivateKey('current', 2, OidcSigningKeyStatus.Current),
      createPrivateKey('previous', 1, OidcSigningKeyStatus.Previous),
    ]);
  });

  it('rejects invalid status combinations', () => {
    expect(() =>
      normalizeOidcPrivateKeys([
        createPrivateKey('current-a', 2, OidcSigningKeyStatus.Current),
        createPrivateKey('current-b', 1, OidcSigningKeyStatus.Current),
      ])
    ).toThrow('Invalid OIDC private key state');
  });
});

describe('getSeededOidcPrivateKeys', () => {
  it('assigns Current/Previous statuses for seeded private keys', () => {
    expect(
      getSeededOidcPrivateKeys([createPrivateKey('current', 2), createPrivateKey('previous', 1)])
    ).toEqual([
      createPrivateKey('current', 2, OidcSigningKeyStatus.Current),
      createPrivateKey('previous', 1, OidcSigningKeyStatus.Previous),
    ]);
  });

  it('rejects more than two seeded private keys', () => {
    expect(() =>
      getSeededOidcPrivateKeys([
        createPrivateKey('current', 3),
        createPrivateKey('previous-a', 2),
        createPrivateKey('previous-b', 1),
      ])
    ).toThrow('CLI seed supports at most 2 OIDC private keys');
  });
});

describe('getImmediatelyRotatedOidcPrivateKeys', () => {
  it('rotates the new key into Current and demotes the current key to Previous', () => {
    expect(
      getImmediatelyRotatedOidcPrivateKeys(
        [
          createPrivateKey('current', 2, OidcSigningKeyStatus.Current),
          createPrivateKey('previous', 1, OidcSigningKeyStatus.Previous),
        ],
        createPrivateKey('new', 3)
      )
    ).toEqual([
      createPrivateKey('new', 3, OidcSigningKeyStatus.Current),
      createPrivateKey('current', 2, OidcSigningKeyStatus.Previous),
    ]);
  });

  it('rejects immediate rotation when a Next key exists', () => {
    expect(() =>
      getImmediatelyRotatedOidcPrivateKeys(
        [
          createPrivateKey('next', 3, OidcSigningKeyStatus.Next),
          createPrivateKey('current', 2, OidcSigningKeyStatus.Current),
          createPrivateKey('previous', 1, OidcSigningKeyStatus.Previous),
        ],
        createPrivateKey('new', 4)
      )
    ).toThrow('Immediate OIDC private key rotation is not allowed when a Next key exists');
  });
});

describe('getStagedRotatedOidcPrivateKeys', () => {
  it('adds a Next key while preserving Current and Previous', () => {
    expect(
      getStagedRotatedOidcPrivateKeys(
        [
          createPrivateKey('current', 2, OidcSigningKeyStatus.Current),
          createPrivateKey('previous', 1, OidcSigningKeyStatus.Previous),
        ],
        createPrivateKey('new', 3)
      )
    ).toEqual([
      createPrivateKey('new', 3, OidcSigningKeyStatus.Next),
      createPrivateKey('current', 2, OidcSigningKeyStatus.Current),
      createPrivateKey('previous', 1, OidcSigningKeyStatus.Previous),
    ]);
  });

  it('replaces an existing Next key during staged re-rotation', () => {
    expect(
      getStagedRotatedOidcPrivateKeys(
        [
          createPrivateKey('next', 4, OidcSigningKeyStatus.Next),
          createPrivateKey('current', 3, OidcSigningKeyStatus.Current),
          createPrivateKey('previous', 2, OidcSigningKeyStatus.Previous),
        ],
        createPrivateKey('replacement', 5)
      )
    ).toEqual([
      createPrivateKey('replacement', 5, OidcSigningKeyStatus.Next),
      createPrivateKey('current', 3, OidcSigningKeyStatus.Current),
      createPrivateKey('previous', 2, OidcSigningKeyStatus.Previous),
    ]);
  });
});

describe('getTrimmedOidcPrivateKeys', () => {
  it('only trims Previous private keys', () => {
    expect(
      getTrimmedOidcPrivateKeys(
        [
          createPrivateKey('current', 2, OidcSigningKeyStatus.Current),
          createPrivateKey('previous', 1, OidcSigningKeyStatus.Previous),
        ],
        1
      )
    ).toEqual([createPrivateKey('current', 2, OidcSigningKeyStatus.Current)]);
  });

  it('rejects trimming non-Previous private keys', () => {
    expect(() =>
      getTrimmedOidcPrivateKeys(
        [
          createPrivateKey('current', 2, OidcSigningKeyStatus.Current),
          createPrivateKey('previous', 1, OidcSigningKeyStatus.Previous),
        ],
        2
      )
    ).toThrow('Only Previous OIDC private keys can be trimmed');
  });
});

describe('rotation state helpers', () => {
  it('creates invalidation-only state', () => {
    expect(getRotationStateForCacheInvalidation({ signingKeyRotationAt: 456 }, 123)).toEqual({
      tenantCacheExpiresAt: 123,
      signingKeyRotationAt: 456,
    });
  });

  it('creates staged rotation state with tenant invalidation and activation timestamps', () => {
    expect(getRotationStateForStagedRotation({ tenantCacheExpiresAt: 1 }, 60, 123)).toEqual({
      tenantCacheExpiresAt: 123,
      signingKeyRotationAt: 60_123,
    });
  });
});
