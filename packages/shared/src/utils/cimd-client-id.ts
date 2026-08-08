/**
 * @overview The CIMD (OAuth Client ID Metadata Document) client identifier namespace predicate.
 *
 * Lives in `@logto/shared` because both runtimes need the same classification: core wires the
 * feature configuration and request-time matching, while the experience client recognizes a CIMD
 * identifier carried over from the authorization request (e.g. to accept SSR settings rendered
 * without an `appId`).
 */

/**
 * Whether the identifier is in the CIMD namespace. Mirrors the scheme test of the fork's
 * `isValidClientIdUrl` (case-insensitive); registered application ids never take the URL shape,
 * so the shape safely routes — the resolved client stays the authority on what a client is.
 */
export const isCimdClientId = (clientId: string): boolean => /^https:\/\//iu.test(clientId);
