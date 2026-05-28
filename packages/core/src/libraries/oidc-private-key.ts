import crypto from 'node:crypto';

import type { OidcPrivateKey } from '@logto/schemas';
import {
  OidcSigningKeyStatus,
  getCurrentOidcPrivateKey,
  getImmediatelyRotatedOidcPrivateKeys,
  getOidcPrivateKeysAfterDeletion,
  getOidcProviderPrivateKeys,
  getRotationStateForStagedRotation,
  getStagedRotatedOidcPrivateKeys,
  normalizeOidcPrivateKeys,
} from '@logto/schemas';
import type { JWK } from 'jose';

import RequestError from '#src/errors/RequestError/index.js';
import { createLogtoConfigQueries } from '#src/queries/logto-config.js';
import type Queries from '#src/tenants/Queries.js';
import { syncSigningKeyRotationStateCache } from '#src/tenants/signing-key-rotation-state.js';
import { exportJWK } from '#src/utils/jwks.js';

export {
  getCanonicalOidcPrivateKeys,
  getCurrentOidcPrivateKey,
  getImmediatelyRotatedOidcPrivateKeys,
  getOidcPrivateKeysAfterDeletion,
  getOidcProviderPrivateKeys,
  getStagedRotatedOidcPrivateKeys,
  normalizeOidcPrivateKeys,
} from '@logto/schemas';

/**
 * Promote a staged Next key into Current and demote the previous Current to Previous.
 * Returns the original normalized key set when no staged activation is pending.
 */
export const rotateOidcPrivateKeyStatuses = (privateKeys: OidcPrivateKey[]): OidcPrivateKey[] => {
  const normalizedPrivateKeys = normalizeOidcPrivateKeys(privateKeys);
  const nextKey = normalizedPrivateKeys.find(({ status }) => status === OidcSigningKeyStatus.Next);

  if (!nextKey) {
    return privateKeys.every(({ status }) => status) ? privateKeys : normalizedPrivateKeys;
  }

  const currentKey = getCurrentOidcPrivateKey(normalizedPrivateKeys);

  return [
    { ...nextKey, status: OidcSigningKeyStatus.Current },
    { ...currentKey, status: OidcSigningKeyStatus.Previous },
  ];
};

/**
 * Export public JWKS from private signing keys in oidc-provider key order.
 */
export const getOidcProviderPublicJwks = async (privateKeys: OidcPrivateKey[]): Promise<JWK[]> => {
  const publicKeys = getOidcProviderPrivateKeys(privateKeys).map(({ value }) =>
    crypto.createPublicKey(value)
  );

  return Promise.all(publicKeys.map(async (key) => exportJWK(key)));
};

export class OidcPrivateKeyLibrary {
  constructor(private readonly queries: Queries) {}

  async deletePrivateSigningKey(keyId: string): Promise<OidcPrivateKey[]> {
    return this.queries.pool.transaction(async (connection) => {
      const logtoConfigQueries = createLogtoConfigQueries(connection, this.queries.wellKnownCache);

      await logtoConfigQueries.lockPrivateSigningKeys();

      const privateKeys = normalizeOidcPrivateKeys(
        await logtoConfigQueries.getPrivateSigningKeys()
      );

      if (privateKeys.length <= 1) {
        throw new RequestError({ code: 'oidc.key_required', status: 422 });
      }

      const deletingKey = privateKeys.find(({ id }) => id === keyId);

      if (!deletingKey) {
        throw new RequestError({ code: 'oidc.key_not_found', id: keyId, status: 404 });
      }

      if (deletingKey.status !== OidcSigningKeyStatus.Previous) {
        throw new RequestError({
          code: 'oidc.only_previous_key_can_be_deleted',
          status: 422,
        });
      }

      const updatedPrivateKeys = getOidcPrivateKeysAfterDeletion(privateKeys, keyId);
      await logtoConfigQueries.upsertPrivateSigningKeys(updatedPrivateKeys);

      return updatedPrivateKeys;
    });
  }

  async rotatePrivateSigningKeys(
    newPrivateKey: OidcPrivateKey,
    rotationGracePeriod = 0
  ): Promise<OidcPrivateKey[]> {
    if (rotationGracePeriod === 0) {
      return this.queries.pool.transaction(async (connection) => {
        const logtoConfigQueries = createLogtoConfigQueries(
          connection,
          this.queries.wellKnownCache
        );

        await logtoConfigQueries.lockPrivateSigningKeys();

        const privateKeys = normalizeOidcPrivateKeys(
          await logtoConfigQueries.getPrivateSigningKeys()
        );

        if (privateKeys.some(({ status }) => status === OidcSigningKeyStatus.Next)) {
          throw new RequestError({ code: 'oidc.invalid_request', status: 422 });
        }

        const updatedPrivateKeys = getImmediatelyRotatedOidcPrivateKeys(privateKeys, newPrivateKey);
        await logtoConfigQueries.upsertPrivateSigningKeys(updatedPrivateKeys);

        return updatedPrivateKeys;
      });
    }

    const { privateKeys, signingKeyRotationState } = await this.queries.pool.transaction(
      async (connection) => {
        const logtoConfigQueries = createLogtoConfigQueries(
          connection,
          this.queries.wellKnownCache
        );

        await logtoConfigQueries.lockPrivateSigningKeysAndRotationState();

        const privateKeys = normalizeOidcPrivateKeys(
          await logtoConfigQueries.getPrivateSigningKeys()
        );
        const currentRotationState = await logtoConfigQueries.getSigningKeyRotationState();
        const updatedPrivateKeys = getStagedRotatedOidcPrivateKeys(privateKeys, newPrivateKey);
        const signingKeyRotationState = getRotationStateForStagedRotation(
          currentRotationState,
          rotationGracePeriod
        );

        await logtoConfigQueries.upsertPrivateSigningKeys(updatedPrivateKeys);
        const persistedRotationState =
          await logtoConfigQueries.upsertSigningKeyRotationState(signingKeyRotationState);

        return {
          privateKeys: updatedPrivateKeys,
          signingKeyRotationState: persistedRotationState,
        };
      }
    );

    void syncSigningKeyRotationStateCache(this.queries.wellKnownCache, signingKeyRotationState);

    return privateKeys;
  }
}
