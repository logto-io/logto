import { isValidCustomTenantId } from '@logto/core-kit';

/**
 * Validate the full custom tenant ID (prefix + suffix).
 *
 * @param value - The suffix value to validate
 * @param prefix - The prefix that will be prepended to the suffix
 * @returns `true` if valid, `false` otherwise
 */
export const validateCustomTenantId = (value: string | undefined, prefix: string): boolean => {
  if (!value) {
    return true;
  }

  return isValidCustomTenantId(prefix + value);
};
