import {
  OidcSigningKeyStatus,
  type LogtoOidcConfigType,
  type OidcPrivateKey,
  type SigningKeyRotationState,
} from '@logto/schemas';

const oidcPrivateKeyStatusOrder: Record<OidcSigningKeyStatus, number> = {
  [OidcSigningKeyStatus.Next]: 0,
  [OidcSigningKeyStatus.Current]: 1,
  [OidcSigningKeyStatus.Previous]: 2,
};

const sortPrivateKeysByStatus = (
  privateKeys: OidcPrivateKey[],
  order: Record<OidcSigningKeyStatus, number>
) =>
  privateKeys.toSorted(
    (leftKey, rightKey) =>
      order[leftKey.status ?? OidcSigningKeyStatus.Previous] -
      order[rightKey.status ?? OidcSigningKeyStatus.Previous]
  );

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
    throw new TypeError('Invalid OIDC private key state');
  }

  return sortPrivateKeysByStatus(normalizedPrivateKeys, oidcPrivateKeyStatusOrder);
};

export const getSeededOidcPrivateKeys = (
  privateKeys: LogtoOidcConfigType['oidc.privateKeys']
): OidcPrivateKey[] => {
  if (privateKeys.length > 2) {
    throw new TypeError('CLI seed supports at most 2 OIDC private keys');
  }

  return normalizeOidcPrivateKeys(privateKeys);
};

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

  const currentKey = normalizedPrivateKeys.find(
    ({ status }) => status === OidcSigningKeyStatus.Current
  );

  if (!currentKey) {
    throw new TypeError('Missing current OIDC private key');
  }

  return [
    { ...newPrivateKey, status: OidcSigningKeyStatus.Current },
    { ...currentKey, status: OidcSigningKeyStatus.Previous },
  ];
};

export const getStagedRotatedOidcPrivateKeys = (
  privateKeys: LogtoOidcConfigType['oidc.privateKeys'],
  newPrivateKey: OidcPrivateKey
): OidcPrivateKey[] => {
  const normalizedPrivateKeys = normalizeOidcPrivateKeys(privateKeys);
  const currentKey = normalizedPrivateKeys.find(
    ({ status }) => status === OidcSigningKeyStatus.Current
  );
  const previousKey = normalizedPrivateKeys.find(
    ({ status }) => status === OidcSigningKeyStatus.Previous
  );

  if (!currentKey) {
    throw new TypeError('Missing current OIDC private key');
  }

  return [
    { ...newPrivateKey, status: OidcSigningKeyStatus.Next },
    { ...currentKey, status: OidcSigningKeyStatus.Current },
    ...(previousKey ? [{ ...previousKey, status: OidcSigningKeyStatus.Previous }] : []),
  ];
};

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

  return normalizedPrivateKeys.slice(0, -length);
};

export const getRotationStateForCacheInvalidation = (
  currentRotationState: SigningKeyRotationState | undefined,
  now = Date.now()
): SigningKeyRotationState => ({
  ...currentRotationState,
  tenantCacheExpiresAt: now,
});

export const getRotationStateForStagedRotation = (
  currentRotationState: SigningKeyRotationState | undefined,
  rotationGracePeriod: number,
  now = Date.now()
): SigningKeyRotationState => ({
  ...currentRotationState,
  tenantCacheExpiresAt: now,
  signingKeyRotationAt: now + rotationGracePeriod * 1000,
});
