export const emailRegEx = /^\S+@\S+\.\S+$/;
/** Validates full email address or email domain. */
export const emailOrEmailDomainRegEx = /^\S+@\S+\.\S+|^@\S+\.\S+$/;
export const phoneRegEx = /^\d+$/;
export const phoneInputRegEx = /^\+?[\d-( )]+$/;
export const usernameRegEx = /^[A-Z_a-z]\w*$/;
export const webRedirectUriProtocolRegEx = /^https?:$/;
export const mobileUriSchemeProtocolRegEx = /^(?!http(s)?:)[a-z][\d+_a-z-]*(\.[\d+_a-z-]+)*:$/;
export const hexColorRegEx = /^#[\da-f]{3}([\da-f]{3})?$/i;
export const dateRegEx = /^\d{4}(-\d{2}){2}/;
export const noSpaceRegEx = /^\S+$/;
/** Full domain that consists of at least 3 parts, e.g. foo.bar.com or example-foo.bar.com */
export const domainRegEx =
  /^[\dA-Za-z](?:[\dA-Za-z-]*[\dA-Za-z])?(?:\.[\dA-Za-z](?:[\dA-Za-z-]*[\dA-Za-z])?){2,}$/;
export const numberAndAlphabetRegEx = /^[\dA-Za-z]+$/;

/**
 * Custom tenant ID validation rules.
 * Used when creating tenants with custom IDs in private cloud regions.
 */

/** Maximum length for custom tenant ID */
export const customTenantIdMaxLength = 21;

/** Pattern for custom tenant ID: lowercase letters, numbers, and hyphens only */
export const customTenantIdRegEx = /^[\da-z-]+$/;

/**
 * Validates a custom tenant ID format.
 * @returns `true` if valid, `false` otherwise
 */
export const isValidCustomTenantId = (id: string): boolean => {
  return id.length <= customTenantIdMaxLength && customTenantIdRegEx.test(id);
};
