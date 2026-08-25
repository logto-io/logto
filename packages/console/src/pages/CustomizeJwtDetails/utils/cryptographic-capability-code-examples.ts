/** Custom JWT cryptographic capability for access tokens. */
export const accessTokenCryptographicCapabilityCodeExample = `/**
 * @param {Payload} payload - The input payload of the function.
 */
getCustomJwtClaims = async ({ api, environmentVariables, context }) => {
  // Prefer HMAC for secret-keyed stable identifiers. SHA-256 alone does not hide
  // enumerable values such as email addresses or phone numbers.
  // Neither method is appropriate for password storage.
  const key = environmentVariables.HMAC_KEY?.trim();

  if (!key) {
    throw new TypeError('HMAC_KEY is missing or empty after trim');
  }

  // Use a high-entropy key without whitespace. Environment variables are visible
  // to Custom JWT administrators and the execution runner; they are not a managed
  // key system. Rotating the key changes every derived value — carry an application
  // key version if you need a migration or dual-value period.
  const userId = context.user.id;

  const stableId = await api.crypto.hmacSha256({ key, input: userId });

  return { stableId };
};`;

/** Custom JWT cryptographic capability for client credentials. */
export const clientCredentialsCryptographicCapabilityCodeExample = `/**
 * @param {Payload} payload - The input payload of the function.
 */
getCustomJwtClaims = async ({ api, environmentVariables, context }) => {
  const ownerId = context.application?.customData.ownerId;

  // Add a pseudonymous owner identifier only when the application has an owner ID.
  // Applications with the same owner ID produce the same value, so consumers can
  // correlate their tokens without receiving the original owner ID.
  if (typeof ownerId !== 'string' || !ownerId) {
    return {};
  }

  const key = environmentVariables.HMAC_KEY?.trim();

  if (!key) {
    throw new TypeError('HMAC_KEY is missing or empty after trim');
  }

  const stableOwnerId = await api.crypto.hmacSha256({ key, input: ownerId });

  return { stableOwnerId };
};`;
