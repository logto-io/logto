import type { LogtoOidcConfigType, OidcPrivateKey, SigningKeyRotationState } from '@logto/schemas';
import { OidcSigningKeyStatus } from '@logto/schemas';

import RequestError from '#src/errors/RequestError/index.js';
import { createLogtoConfigQueries } from '#src/queries/logto-config.js';
import type Queries from '#src/tenants/Queries.js';
import { syncSigningKeyRotationStateCache } from '#src/tenants/signing-key-rotation-state.js';

type NormalizedOidcPrivateKey = OidcPrivateKey & {
  status: OidcSigningKeyStatus;
};

const oidcPrivateKeyStatusOrder: Record<OidcSigningKeyStatus, number> = {
  [OidcSigningKeyStatus.Next]: 0,
  [OidcSigningKeyStatus.Current]: 1,
  [OidcSigningKeyStatus.Previous]: 2,
};

const oidcProviderPrivateKeyOrder: Record<OidcSigningKeyStatus, number> = {
  [OidcSigningKeyStatus.Current]: 0,
  [OidcSigningKeyStatus.Next]: 1,
  [OidcSigningKeyStatus.Previous]: 2,
};

const sortOidcPrivateKeys = (
  privateKeys: NormalizedOidcPrivateKey[],
  order: Record<OidcSigningKeyStatus, number>
): NormalizedOidcPrivateKey[] =>
  privateKeys.toSorted((left, right) => order[left.status] - order[right.status]);

/**
 * Normalize private signing keys from legacy index-based lifecycle semantics into explicit statuses.
 */
export const normalizeOidcPrivateKeys = (
  privateKeys: LogtoOidcConfigType['oidc.privateKeys']
): NormalizedOidcPrivateKey[] => {
  const normalizedPrivateKeys = privateKeys.map((privateKey, index) => ({
    ...privateKey,
    status:
      privateKey.status ??
      (index === 0 ? OidcSigningKeyStatus.Current : OidcSigningKeyStatus.Previous),
  }));

  const currentKeys = normalizedPrivateKeys.filter(
    ({ status }) => status === OidcSigningKeyStatus.Current
  );
  const nextKeys = normalizedPrivateKeys.filter(
    ({ status }) => status === OidcSigningKeyStatus.Next
  );
  const previousKeys = normalizedPrivateKeys.filter(
    ({ status }) => status === OidcSigningKeyStatus.Previous
  );

  if (currentKeys.length !== 1 || nextKeys.length > 1 || previousKeys.length > 1) {
    throw new Error(
      'Malformed OIDC private key status configuration: expected exactly one Current key and at most one Next and Previous key.'
    );
  }

  return normalizedPrivateKeys;
};

/**
 * Order private signing keys in the canonical business-state order.
 */
export const getCanonicalOidcPrivateKeys = (
  privateKeys: LogtoOidcConfigType['oidc.privateKeys']
): OidcPrivateKey[] =>
  sortOidcPrivateKeys(normalizeOidcPrivateKeys(privateKeys), oidcPrivateKeyStatusOrder);

/**
 * Get the effective current signing key from normalized private key state.
 */
export const getCurrentOidcPrivateKey = (
  privateKeys: LogtoOidcConfigType['oidc.privateKeys']
): OidcPrivateKey => {
  const currentKey = normalizeOidcPrivateKeys(privateKeys).find(
    ({ status }) => status === OidcSigningKeyStatus.Current
  );

  if (!currentKey) {
    throw new Error('Malformed OIDC private key status configuration: missing Current key.');
  }

  return currentKey;
};

/**
 * Order private signing keys the way oidc-provider should consume them.
 */
export const getOidcProviderPrivateKeys = (
  privateKeys: LogtoOidcConfigType['oidc.privateKeys']
): OidcPrivateKey[] =>
  sortOidcPrivateKeys(normalizeOidcPrivateKeys(privateKeys), oidcProviderPrivateKeyOrder);

/**
 * Build the persisted private-key state for the current immediate-rotation flow.
 */
export const getImmediatelyRotatedOidcPrivateKeys = (
  privateKeys: LogtoOidcConfigType['oidc.privateKeys'],
  newPrivateKey: OidcPrivateKey
): OidcPrivateKey[] => {
  const currentKey = getCurrentOidcPrivateKey(privateKeys);

  return [
    { ...newPrivateKey, status: OidcSigningKeyStatus.Current },
    { ...currentKey, status: OidcSigningKeyStatus.Previous },
  ];
};

/**
 * Build the persisted private-key state for staged rotation.
 * Replaces any existing Next key while preserving the current Current and Previous keys.
 */
export const getStagedRotatedOidcPrivateKeys = (
  privateKeys: LogtoOidcConfigType['oidc.privateKeys'],
  newPrivateKey: OidcPrivateKey
): OidcPrivateKey[] => {
  const normalizedPrivateKeys = normalizeOidcPrivateKeys(privateKeys);
  const currentKey = getCurrentOidcPrivateKey(normalizedPrivateKeys);
  const previousKey = normalizedPrivateKeys.find(
    ({ status }) => status === OidcSigningKeyStatus.Previous
  );

  return [
    { ...newPrivateKey, status: OidcSigningKeyStatus.Next },
    { ...currentKey, status: OidcSigningKeyStatus.Current },
    ...(previousKey ? [{ ...previousKey, status: OidcSigningKeyStatus.Previous }] : []),
  ];
};

/**
 * Promote a staged Next key into Current and demote the previous Current to Previous.
 * Returns the original normalized key set when no staged activation is pending.
 */
export const rotateOidcPrivateKeyStatuses = (
  privateKeys: LogtoOidcConfigType['oidc.privateKeys']
): OidcPrivateKey[] => {
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
 * Rebuild the immediate-flow persisted private-key state after deleting a Previous key.
 */
export const getOidcPrivateKeysAfterDeletion = (
  privateKeys: LogtoOidcConfigType['oidc.privateKeys'],
  deletedKeyId: string
): OidcPrivateKey[] =>
  getCanonicalOidcPrivateKeys(privateKeys).filter(({ id }) => id !== deletedKeyId);

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

          if (privateKeys.some(({ status }) => status === OidcSigningKeyStatus.Next)) {
            throw new RequestError({ code: 'oidc.invalid_request', status: 422 });
          }

          const updatedPrivateKeys = getImmediatelyRotatedOidcPrivateKeys(
            privateKeys,
            newPrivateKey
          );
          await logtoConfigQueries.upsertPrivateSigningKeys(updatedPrivateKeys);
          const signingKeyRotationState = await logtoConfigQueries.setTenantCacheExpiresAt(
            Date.now()
          );

          return {
            privateKeys: updatedPrivateKeys,
            signingKeyRotationState,
          };
        }
      );

      void syncSigningKeyRotationStateCache(this.queries.wellKnownCache, signingKeyRotationState);

      return privateKeys;
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
        const signingKeyRotationState = getSigningKeyRotationStateForStagedRotation(
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

const getSigningKeyRotationStateForStagedRotation = (
  currentRotationState: SigningKeyRotationState | undefined,
  rotationGracePeriod: number
): SigningKeyRotationState => {
  const now = Date.now();

  return {
    ...currentRotationState,
    tenantCacheExpiresAt: now,
    signingKeyRotationAt: now + rotationGracePeriod * 1000,
  };
};
