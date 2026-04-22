import { describe, expect, it } from 'vitest';

import { OidcSigningKeyStatus } from '../types/index.js';

import {
  getCanonicalOidcPrivateKeys,
  getCurrentOidcPrivateKey,
  getImmediatelyRotatedOidcPrivateKeys,
  getOidcPrivateKeysAfterDeletion,
  getOidcProviderPrivateKeys,
  getRotationStateForCacheInvalidation,
  getRotationStateForStagedRotation,
  getSeededOidcPrivateKeys,
  getStagedRotatedOidcPrivateKeys,
  getTrimmedOidcPrivateKeys,
  normalizeOidcPrivateKeys,
  rotateOidcPrivateKeyStatuses,
} from './oidc-private-key.js';

const createPrivateKey = (id: string, createdAt: number, status?: OidcSigningKeyStatus) => ({
  id,
  value: `private-key-${id}`,
  createdAt,
  status,
});

describe('OIDC private key helpers', () => {
  it('normalizes legacy private keys without status into Current and Previous', () => {
    expect(
      normalizeOidcPrivateKeys([createPrivateKey('current', 1), createPrivateKey('previous', 2)])
    ).toEqual([
      createPrivateKey('current', 1, OidcSigningKeyStatus.Current),
      createPrivateKey('previous', 2, OidcSigningKeyStatus.Previous),
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

  it('orders private keys in canonical business order', () => {
    expect(
      getCanonicalOidcPrivateKeys([
        createPrivateKey('previous', 3, OidcSigningKeyStatus.Previous),
        createPrivateKey('current', 2, OidcSigningKeyStatus.Current),
        createPrivateKey('next', 1, OidcSigningKeyStatus.Next),
      ])
    ).toEqual([
      createPrivateKey('next', 1, OidcSigningKeyStatus.Next),
      createPrivateKey('current', 2, OidcSigningKeyStatus.Current),
      createPrivateKey('previous', 3, OidcSigningKeyStatus.Previous),
    ]);
  });

  it('orders private keys for oidc-provider consumption', () => {
    expect(
      getOidcProviderPrivateKeys([
        createPrivateKey('previous', 3, OidcSigningKeyStatus.Previous),
        createPrivateKey('current', 2, OidcSigningKeyStatus.Current),
        createPrivateKey('next', 1, OidcSigningKeyStatus.Next),
      ])
    ).toEqual([
      createPrivateKey('current', 2, OidcSigningKeyStatus.Current),
      createPrivateKey('next', 1, OidcSigningKeyStatus.Next),
      createPrivateKey('previous', 3, OidcSigningKeyStatus.Previous),
    ]);
  });

  it('finds the current signing key by status', () => {
    expect(
      getCurrentOidcPrivateKey([
        createPrivateKey('previous', 3, OidcSigningKeyStatus.Previous),
        createPrivateKey('current', 2, OidcSigningKeyStatus.Current),
        createPrivateKey('next', 1, OidcSigningKeyStatus.Next),
      ])
    ).toEqual(createPrivateKey('current', 2, OidcSigningKeyStatus.Current));
  });

  it('assigns statuses to seeded keys', () => {
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

  it('immediately rotates the new key into Current', () => {
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

  it('stages the new key as Next while preserving Current and Previous', () => {
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

  it('promotes Next to Current during activation', () => {
    expect(
      rotateOidcPrivateKeyStatuses([
        createPrivateKey('next', 3, OidcSigningKeyStatus.Next),
        createPrivateKey('current', 2, OidcSigningKeyStatus.Current),
        createPrivateKey('previous', 1, OidcSigningKeyStatus.Previous),
      ])
    ).toEqual([
      createPrivateKey('next', 3, OidcSigningKeyStatus.Current),
      createPrivateKey('current', 2, OidcSigningKeyStatus.Previous),
    ]);
  });

  it('preserves status order when deleting Previous', () => {
    expect(
      getOidcPrivateKeysAfterDeletion(
        [
          createPrivateKey('next', 3, OidcSigningKeyStatus.Next),
          createPrivateKey('current', 2, OidcSigningKeyStatus.Current),
          createPrivateKey('previous', 1, OidcSigningKeyStatus.Previous),
        ],
        'previous'
      )
    ).toEqual([
      createPrivateKey('next', 3, OidcSigningKeyStatus.Next),
      createPrivateKey('current', 2, OidcSigningKeyStatus.Current),
    ]);
  });

  it('only trims Previous keys', () => {
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

  it('trims the Previous key even when the input order is not canonical', () => {
    expect(
      getTrimmedOidcPrivateKeys(
        [
          createPrivateKey('previous', 1, OidcSigningKeyStatus.Previous),
          createPrivateKey('current', 2, OidcSigningKeyStatus.Current),
        ],
        1
      )
    ).toEqual([createPrivateKey('current', 2, OidcSigningKeyStatus.Current)]);
  });

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
