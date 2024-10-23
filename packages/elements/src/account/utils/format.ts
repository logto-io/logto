import { parsePhoneNumberWithError } from 'libphonenumber-js';

/**
 * Parse phone number to readable international format.
 * E.g. 16502530000 -> +1 650 253 0000
 *
 * Note:
 * This function is identical to the one in `shared/src/utils/phone.ts`, but is duplicated here
 * because the `shared` package's universal module includes Node.js-specific methods, making it
 * unusable in the `elements` project. An issue has been created to address this in the `shared`
 * module in the future.
 *
 * TODO: @xiaoyijun LOG-10299
 */
export const formatToInternationalPhoneNumber = (phone: string) => {
  try {
    const phoneNumber = phone.startsWith('+') ? phone : `+${phone}`;
    return parsePhoneNumberWithError(phoneNumber).formatInternational();
  } catch {
    // If parsing fails, return the original phone number
    return phone;
  }
};
