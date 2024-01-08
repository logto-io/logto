export const emailRegEx = /^\S+@\S+\.\S+$/;
export const phoneRegEx = /^\d+$/;
export const phoneInputRegEx = /^\+?[\d-( )]+$/;
export const usernameRegEx = /^[A-Z_a-z]\w*$/;
export const webRedirectUriProtocolRegEx = /^https?:$/;
/**
 * Strict custom URI scheme check that matches the OIDC recommended pattern: a reversed domain name followed by a colon.
 * E.g. `com.myapp://callback` is a valid redirect URI, but `myapp://callback` is not.
 */
export const mobileUriSchemeProtocolRegEx = /^[a-z][\d+_a-z-]*(\.[\d+_a-z-]+)+:$/;
/**
 * Loose custom URI scheme check that matches any non-whitespace character followed by a colon, for better compatibility.
 * Community reports that some windows native apps use this scheme pattern. E.g. `myapp://callback`
 */
export const looseNativeUriSchemeProtocolRegEx = /^\S*:$/;
export const hexColorRegEx = /^#[\da-f]{3}([\da-f]{3})?$/i;
export const dateRegex = /^\d{4}(-\d{2}){2}/;
export const noSpaceRegEx = /^\S+$/;
