import { parsePhoneNumberWithError } from 'libphonenumber-js';

/**
 * Parse phone number to number string.
 * E.g. +1 (650) 253-0000 -> 16502530000
 */
export const parsePhoneNumber = (phone: string) => {
  try {
    return parsePhoneNumberWithError(phone).number.slice(1);
  } catch {
    console.error(`Invalid phone number: ${phone}`);
    return phone;
  }
};

/**
 * Parse phone number to readable international format.
 * E.g. 16502530000 -> +1 650 253 0000
 */
export const formatToInternationalPhoneNumber = (phone: string) => {
  try {
    const phoneNumber = phone.startsWith('+') ? phone : `+${phone}`;
    return parsePhoneNumberWithError(phoneNumber).formatInternational();
  } catch {
    console.error(`Invalid phone number: ${phone}`);
    return phone;
  }
};
