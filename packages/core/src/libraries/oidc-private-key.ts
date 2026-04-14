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

type NormalizedOidcPrivateKey = OidcPrivateKey & { status: OidcSigningKeyStatus };

/**
 * Normalize private signing keys from legacy index-based lifecycle semantics into explicit statuses.
 */
export const normalizeOidcPrivateKeys = (
  privateKeys: LogtoOidcConfigType['oidc.privateKeys']
): NormalizedOidcPrivateKey[] => {
  const normalizedPrivateKeys: NormalizedOidcPrivateKey[] = privateKeys.map(
    (privateKey, index) => ({
      ...privateKey,
      status:
        privateKey.status ??
        (index === 0 ? OidcSigningKeyStatus.Current : OidcSigningKeyStatus.Previous),
    })
  );

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
 * Get private signing keys in the order expected by oidc-provider for active signing.
 */
export const getOidcProviderPrivateKeys = (
  privateKeys: LogtoOidcConfigType['oidc.privateKeys']
): NormalizedOidcPrivateKey[] =>
  normalizeOidcPrivateKeys(privateKeys).toSorted(
    (left, right) =>
      oidcProviderPrivateKeyOrder[left.status] - oidcProviderPrivateKeyOrder[right.status]
  );
