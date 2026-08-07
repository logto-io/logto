/**
 * @overview The CIMD client identifier namespace predicate.
 *
 * Lives in its own dependency-free module because both sides of the CIMD wiring need it:
 * `./index.js` (feature configuration) and `../redirect-uri/index.js` (request-time matching)
 * import each other's counterpart, so hosting the predicate in either would create a cycle.
 */

/**
 * Whether the identifier is in the CIMD namespace. Mirrors the scheme test of the fork's
 * `isValidClientIdUrl` (case-insensitive); registered application ids never take the URL shape,
 * so the shape safely routes — the resolved client stays the authority on what a client is.
 */
export const isCimdClientId = (clientId: string): boolean => /^https:\/\//iu.test(clientId);
