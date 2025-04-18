import { parsePhoneNumberWithError } from 'libphonenumber-js/mobile';
import type { E164Number, PhoneNumber } from 'libphonenumber-js/mobile';

export { ParseError } from 'libphonenumber-js/mobile';

function validateE164Number(value: string): asserts value is E164Number {
  if (value && !value.startsWith('+')) {
    throw new TypeError(`Invalid E164Number: ${value}`);
  }
}

const parseE164Number = (value: string): E164Number | '' => {
  if (!value) {
    /**
     * The type inference engine can not properly infer the type of the empty string,
     * but using `string` instead. So we need to cast it.
     */
    // eslint-disable-next-line no-restricted-syntax
    return value as '';
  }

  const result = value.startsWith('+') ? value : `+${value}`;
  validateE164Number(result);
  return result;
};

export const parseE164PhoneNumberWithError = (value: string): PhoneNumber => {
  const phoneNumberWithE164Format = parseE164Number(value);
  return parsePhoneNumberWithError(phoneNumberWithE164Format);
};

/**
 * Parse phone number to number string.
 * E.g. +1 (650) 253-0000 -> 16502530000
 */
export const parsePhoneNumber = (phone: string) => {
  try {
    return parseE164PhoneNumberWithError(phone).number.slice(1);
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
    return parseE164PhoneNumberWithError(phone).formatInternational();
  } catch {
    console.error(`Invalid phone number: ${phone}`);
    return phone;
  }
};
