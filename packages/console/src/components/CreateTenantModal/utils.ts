import { customTenantIdMaxLength, customTenantIdRegEx } from '@logto/core-kit';

/**
 * Validate the custom tenant ID suffix.
 *
 * @param value - The suffix value to validate
 * @param prefix - The prefix that will be prepended to the suffix
 * @returns `true` if valid, or an error message string if invalid
 */
export const validateTenantIdSuffix = (
  value: string | undefined,
  prefix: string
): string | true => {
  if (!value) {
    return true;
  }

  if (!customTenantIdRegEx.test(value)) {
    return 'Only lowercase letters, numbers, and hyphens are allowed';
  }

  if (value.startsWith('-') || value.endsWith('-')) {
    return 'Cannot start or end with a hyphen';
  }

  if (prefix.length + value.length > customTenantIdMaxLength) {
    return `Total length cannot exceed ${customTenantIdMaxLength} characters`;
  }

  return true;
};
