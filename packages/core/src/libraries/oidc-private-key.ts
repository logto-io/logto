import type { LogtoOidcConfigType, OidcPrivateKey } from '@logto/schemas';
import { OidcSigningKeyStatus } from '@logto/schemas';

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

/**
 * Normalize private signing keys from legacy index-based lifecycle semantics into explicit statuses.
 */
export const normalizeOidcPrivateKeys = (
  privateKeys: LogtoOidcConfigType['oidc.privateKeys']
): OidcPrivateKey[] => {
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

  return normalizedPrivateKeys.toSorted(
    (left, right) =>
      oidcPrivateKeyStatusOrder[left.status] - oidcPrivateKeyStatusOrder[right.status]
  );
};

/**
 * Order private signing keys the way oidc-provider should consume them for signing and publication.
 */
export const getOidcProviderPrivateKeys = (
  privateKeys: LogtoOidcConfigType['oidc.privateKeys']
): OidcPrivateKey[] =>
  normalizeOidcPrivateKeys(privateKeys).toSorted(
    (left, right) =>
      oidcProviderPrivateKeyOrder[left.status ?? OidcSigningKeyStatus.Previous] -
      oidcProviderPrivateKeyOrder[right.status ?? OidcSigningKeyStatus.Previous]
  );

/**
 * Build the persisted private-key state for the current immediate-rotation flow.
 */
export const getImmediatelyRotatedOidcPrivateKeys = (
  privateKeys: LogtoOidcConfigType['oidc.privateKeys'],
  newPrivateKey: OidcPrivateKey
): OidcPrivateKey[] => {
  const normalizedPrivateKeys = normalizeOidcPrivateKeys(privateKeys);
  const currentKey = normalizedPrivateKeys.find(
    ({ status }) => status === OidcSigningKeyStatus.Current
  );

  return [
    { ...newPrivateKey, status: OidcSigningKeyStatus.Current },
    ...(currentKey ? [{ ...currentKey, status: OidcSigningKeyStatus.Previous }] : []),
  ];
};

/**
 * Rebuild the immediate-flow persisted private-key state after deleting a Previous key.
 */
export const getOidcPrivateKeysAfterDeletion = (
  privateKeys: LogtoOidcConfigType['oidc.privateKeys'],
  deletedKeyId: string
): OidcPrivateKey[] =>
  normalizeOidcPrivateKeys(privateKeys)
    .filter(({ id }) => id !== deletedKeyId)
    .map((privateKey, index) => ({
      ...privateKey,
      status: index === 0 ? OidcSigningKeyStatus.Current : OidcSigningKeyStatus.Previous,
    }));
