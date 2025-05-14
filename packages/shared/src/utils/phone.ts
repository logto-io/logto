import { parsePhoneNumberWithError, type PhoneNumber } from 'libphonenumber-js';

/**
 * Parse phone number to E.164 format.
 * This method will add a leading `+` sign if the phone number does not start with it.
 */
export const parseE164Number = (phone: string) => {
  if (!phone || phone.startsWith('+')) {
    return phone;
  }

  return `+${phone}`;
};

/**
 * Parse phone number to number string.
 * This method will strip the:
 *  - leading `+` sign of the country code if any,
 *  - the leading `0` of the phone number if any,
 *  - non-digit characters if any.
 *
 * @params phone - The phone number to parse.
 * @params throwError - If true, throw an error if the phone number is invalid. Otherwise, return the original phone number.
 *
 * @example
 * +1 (650) 253-0000 -> 16502530000
 *
 * @example
 * +61 0412 345 678 -> 61412345678
 */
export const parsePhoneNumber = (phone: string, throwError?: true) => {
  try {
    return parsePhoneNumberWithError(parseE164Number(phone)).number.slice(1);
  } catch (error: unknown) {
    if (throwError) {
      throw error;
    }

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

export class PhoneNumberParser {
  static parse(phone: string) {
    return parsePhoneNumberWithError(parseE164Number(phone));
  }

  readonly #parsedPhoneNumber?: PhoneNumber;

  readonly #isValid: boolean;

  constructor(private readonly phone: string) {
    try {
      this.#parsedPhoneNumber = PhoneNumberParser.parse(phone);
      this.#isValid = true;
    } catch {
      this.#isValid = false;
    }
  }

  get raw() {
    return this.phone;
  }

  get isValid() {
    return this.#isValid;
  }

  get countryCode() {
    return this.#parsedPhoneNumber?.countryCallingCode;
  }

  /**
   * Local number without country code.
   */
  get nationalNumber() {
    return this.#parsedPhoneNumber?.nationalNumber;
  }

  /**
   * Formatted international number. With
   * - leading `+` sign stripped,
   * - leading `0` of the phone number stripped,
   * - non-digit characters stripped.
   *
   * @remarks
   * Logto use this format to store phone number in the database.
   *
   * @example
   * +1 (650) 253-0000 -> 16502530000
   */
  get internationalNumber() {
    if (!this.#isValid || !this.nationalNumber || !this.countryCode) {
      // eslint-disable-next-line getter-return
      return;
    }

    return `${this.countryCode}${this.nationalNumber}`;
  }

  /**
   * Formatted international number with leading `0` of the phone number.
   *
   * @example
   * 61 412 345 678 -> 610412345678
   *
   * @remarks
   * In some countries, local phone numbers are often entered with a leading '0'.
   * However, in the international format that includes the country code, this leading '0' should be removed.
   *
   * The previous implementation did not handle this correctly, causing the combination of country code + 0 + local number
   *  to be treated as different from country code + local number in the Logto system.
   *
   * Both formats should be considered the same phone number.
   *
   * We use this format to find the legacy phone number in the database incase the user registered the phone number with leading `0`.
   */
  get internationalNumberWithLeadingZero() {
    if (!this.#isValid || !this.nationalNumber || !this.countryCode) {
      // eslint-disable-next-line getter-return
      return;
    }

    return `${this.countryCode}0${this.nationalNumber}`;
  }
}
