import { parsePhoneNumberWithError } from 'libphonenumber-js';

/**
 * Parse phone number to readable international format.
 * E.g. 16502530000 -> +1 650 253 0000
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
