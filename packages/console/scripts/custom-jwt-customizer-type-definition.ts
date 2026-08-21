/**
 * @fileoverview
 *
 * This file manually define some of the types that are used in the JWT customizer scripts.
 */

/** Authoring type definition for the Custom JWT `api` context without cryptography. */
export const jwtCustomizerApiContextTypeDefinition = `type CustomJwtApiContext = {
  /**
   * Reject the current token request.
   *
   * @remarks
   * This function will reject the current token request and throw
   * an OIDC AccessDenied error to the client.
   *
   * @param {string} [message] - The custom error message.
   */
  denyAccess: (message?: string) => never;
};`;

/**
 * Authoring type definition when Custom JWT cryptographic capability is available.
 * `crypto` is required so scripts can call `api.crypto.sha256()` directly.
 *
 * Custom JWT cryptographic capability
 */
export const jwtCustomizerApiContextWithCryptoTypeDefinition = `type CustomJwtApiContext = {
  /**
   * Reject the current token request.
   *
   * @remarks
   * This function will reject the current token request and throw
   * an OIDC AccessDenied error to the client.
   *
   * @param {string} [message] - The custom error message.
   */
  denyAccess: (message?: string) => never;
  /**
   * Curated cryptographic operations.
   *
   * - sha256(input) returns lowercase hex of SHA-256(UTF-8(input)).
   * - hmacSha256({ key, input }) returns lowercase hex of HMAC-SHA-256(UTF-8(key), UTF-8(input)).
   * Both methods return Promise<string>.
   */
  crypto: {
    sha256: (input: string) => Promise<string>;
    hmacSha256: (options: { key: string; input: string }) => Promise<string>;
  };
};`;
