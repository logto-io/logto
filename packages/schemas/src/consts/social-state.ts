/**
 * Prefixes of the OAuth `state` parameter used by the first-party clients that share the
 * `/callback/:connectorId` social callback URI.
 *
 * Logto Core routes an incoming callback by looking at the `state` prefix, so the prefixes must
 * never be a prefix of each other. Keep them defined together to preserve that invariant.
 *
 * A `state` carrying no known prefix falls back to the Sign-in Experience, which keeps in-flight
 * requests and custom sign-in UIs that build their own `state` working.
 */
export const accountCenterSocialStatePrefix = 'ac_';
export const experienceSocialStatePrefix = 'se_';
