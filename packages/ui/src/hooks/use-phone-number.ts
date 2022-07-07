/**
 * Provide PhoneNumber Format support
 * Reference [libphonenumber-js](https://gitlab.com/catamphetamine/libphonenumber-js)
 */

import {
  parsePhoneNumberWithError,
  getCountries,
  getCountryCallingCode,
  CountryCallingCode,
  CountryCode,
  E164Number,
  ParseError,
} from 'libphonenumber-js';
import { useState } from 'react';
// Should not need the react-phone-number-input package, but we use its locale country name for now
import en from 'react-phone-number-input/locale/en.json';

export type { CountryCallingCode } from 'libphonenumber-js';

/**
 * Provide Country Code Options
 * TODO: Country Name i18n
 */
export type CountryMetaData = {
  countryCode: CountryCode;
  countryCallingCode: CountryCallingCode;
  countryName?: string;
};

export const countryList: CountryMetaData[] = getCountries().map((code) => {
  const callingCode = getCountryCallingCode(code);
  const countryName = en[code];

  return {
    countryCode: code,
    countryCallingCode: callingCode,
    countryName,
  };
});

type PhoneNumberData = {
  countryCallingCode: string;
  nationalNumber: string;
};

const parseE164Number = (value: string): E164Number | '' => {
  if (!value || value.startsWith('+')) {
    return value;
  }

  return `+${value}`;
};

const isValidPhoneNumber = (value: string): boolean => {
  try {
    const phoneNumber = parsePhoneNumberWithError(parseE164Number(value));

    return phoneNumber.isValid();
  } catch (error: unknown) {
    if (error instanceof ParseError) {
      return false;
    }
    throw error;
  }
};

export const defaultCountryCode: CountryCode = 'CN';
export const defaultCountryCallingCode = getCountryCallingCode(defaultCountryCode);

const usePhoneNumber = () => {
  const [phoneNumber, setPhoneNumber] = useState<PhoneNumberData>({
    countryCallingCode: defaultCountryCallingCode,
    nationalNumber: '',
  });

  return {
    phoneNumber,
    setPhoneNumber,
    isValidPhoneNumber,
  };
};

export default usePhoneNumber;
