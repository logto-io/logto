import type {
  LogtoOidcConfigType,
  OidcPrivateKey,
  SigningKeyRotationState,
} from '../types/index.js';
import { OidcSigningKeyStatus } from '../types/index.js';

export type NormalizedOidcPrivateKey = OidcPrivateKey & {
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
  privateKeys.toSorted((leftKey, rightKey) => order[leftKey.status] - order[rightKey.status]);

/**
 * Normalize OIDC private signing keys into an explicit status-based model.
 *
 * Legacy keys without `status` are interpreted by index order:
 * the first key becomes `Current` and the second key becomes `Previous`.
 * The helper also validates that the key set contains exactly one `Current`
 * and at most one `Next` and `Previous`.
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
 * Return private keys in canonical business order: `Next`, then `Current`, then `Previous`.
 *
 * This order is useful when the caller wants a stable persisted view of key lifecycle state.
 */
export const getCanonicalOidcPrivateKeys = (
  privateKeys: LogtoOidcConfigType['oidc.privateKeys']
): OidcPrivateKey[] =>
  sortOidcPrivateKeys(normalizeOidcPrivateKeys(privateKeys), oidcPrivateKeyStatusOrder);

/**
 * Return the currently active signing key from a private-key set.
 *
 * This helper reads explicit key status rather than relying on array index.
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
 * Return private keys in the order expected by `oidc-provider` for signing and JWKS exposure.
 *
 * The active `Current` key comes first, followed by `Next`, then `Previous`.
 */
export const getOidcProviderPrivateKeys = (
  privateKeys: LogtoOidcConfigType['oidc.privateKeys']
): OidcPrivateKey[] =>
  sortOidcPrivateKeys(normalizeOidcPrivateKeys(privateKeys), oidcProviderPrivateKeyOrder);

/**
 * Normalize seeded private keys into the explicit status model used by core and CLI.
 *
 * Seeding only supports the legacy one-key or two-key layout, so the helper rejects
 * larger key arrays instead of trying to infer a more complex state machine.
 */
export const getSeededOidcPrivateKeys = (
  privateKeys: LogtoOidcConfigType['oidc.privateKeys']
): OidcPrivateKey[] => {
  if (privateKeys.length > 2) {
    throw new TypeError('CLI seed supports at most 2 OIDC private keys');
  }

  return normalizeOidcPrivateKeys(privateKeys);
};

/**
 * Build the persisted private-key state for immediate rotation.
 *
 * The new key becomes `Current`, the previous `Current` key becomes `Previous`,
 * and any older `Previous` key is dropped.
 */
export const getImmediatelyRotatedOidcPrivateKeys = (
  privateKeys: LogtoOidcConfigType['oidc.privateKeys'],
  newPrivateKey: OidcPrivateKey
): OidcPrivateKey[] => {
  const normalizedPrivateKeys = normalizeOidcPrivateKeys(privateKeys);

  if (normalizedPrivateKeys.some(({ status }) => status === OidcSigningKeyStatus.Next)) {
    throw new TypeError(
      'Immediate OIDC private key rotation is not allowed when a Next key exists'
    );
  }

  const currentKey = getCurrentOidcPrivateKey(normalizedPrivateKeys);

  return [
    { ...newPrivateKey, status: OidcSigningKeyStatus.Current },
    { ...currentKey, status: OidcSigningKeyStatus.Previous },
  ];
};

/**
 * Build the persisted private-key state for staged rotation.
 *
 * The new key becomes `Next`, the existing `Current` key stays `Current`,
 * and the existing `Previous` key is preserved when present.
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
 * Promote a staged `Next` key into `Current` and demote the previous `Current` key into `Previous`.
 *
 * If no staged rotation is pending, the helper returns the original key array when it already
 * uses explicit statuses, or the normalized array when the input is still in legacy form.
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
 * Remove a single private key from the canonical key set after delete validation has already passed.
 *
 * The helper keeps the remaining keys in canonical status order and does not attempt to infer
 * new lifecycle transitions beyond dropping the deleted key.
 */
export const getOidcPrivateKeysAfterDeletion = (
  privateKeys: LogtoOidcConfigType['oidc.privateKeys'],
  deletedKeyId: string
): OidcPrivateKey[] =>
  getCanonicalOidcPrivateKeys(privateKeys).filter(({ id }) => id !== deletedKeyId);

/**
 * Trim one or more `Previous` private keys from the end of the normalized key set.
 *
 * Only `Previous` keys are trim-able; attempting to trim past the available `Previous`
 * keys indicates an invalid operation.
 */
export const getTrimmedOidcPrivateKeys = (
  privateKeys: LogtoOidcConfigType['oidc.privateKeys'],
  length: number
): OidcPrivateKey[] => {
  const normalizedPrivateKeys = normalizeOidcPrivateKeys(privateKeys);
  const previousKeys = normalizedPrivateKeys.filter(
    ({ status }) => status === OidcSigningKeyStatus.Previous
  );

  if (length > previousKeys.length) {
    throw new TypeError('Only Previous OIDC private keys can be trimmed');
  }

  return getCanonicalOidcPrivateKeys(normalizedPrivateKeys).slice(0, -length);
};

/**
 * Build rotation state for immediate tenant cache invalidation.
 *
 * This records when a tenant instance should be considered stale so the next reload
 * can pick up newly written signing key data.
 */
export const getRotationStateForCacheInvalidation = (
  currentRotationState: SigningKeyRotationState | undefined,
  now = Date.now()
): SigningKeyRotationState => ({
  ...currentRotationState,
  tenantCacheExpiresAt: now,
});

/**
 * Build rotation state for staged private-key rotation.
 *
 * In addition to immediate tenant invalidation, this records the future activation time
 * when the staged `Next` key should be promoted to `Current`.
 */
export const getRotationStateForStagedRotation = (
  currentRotationState: SigningKeyRotationState | undefined,
  rotationGracePeriod: number,
  now = Date.now()
): SigningKeyRotationState => ({
  ...currentRotationState,
  tenantCacheExpiresAt: now,
  signingKeyRotationAt: now + rotationGracePeriod * 1000,
});
