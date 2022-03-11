/**
 * Provide PhoneNumber Format support
 * Reference [libphonenumber-js](https://gitlab.com/catamphetamine/libphonenumber-js)
 */

import {
  parsePhoneNumber as _parsePhoneNumber,
  getCountries,
  getCountryCallingCode,
  CountryCallingCode,
  CountryCode,
  E164Number,
  ParseError,
} from 'libphonenumber-js';
import { useState, useEffect } from 'react';
// Should not need the react-phone-number-input package, but we use its locale country name for now
import en from 'react-phone-number-input/locale/en.json';

export type { CountryCallingCode } from 'libphonenumber-js';

/**
 * TODO: Get Default Country Code
 */
const defaultCountryCode: CountryCode = 'CN';

export const defaultCountryCallingCode: CountryCallingCode =
  getCountryCallingCode(defaultCountryCode);

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

// Add interact status to prevent the initial onUpdate useEffect call
type PhoneNumberState = PhoneNumberData & { interacted: boolean };

const parseE164Number = (value: string): E164Number | '' => {
  if (!value || value.startsWith('+')) {
    return value;
  }

  return `+${value}`;
};

export const parsePhoneNumber = (value: string): [ParseError?, PhoneNumberData?] => {
  try {
    const phoneNumber = _parsePhoneNumber(parseE164Number(value));
    const { countryCallingCode, nationalNumber } = phoneNumber;

    return [undefined, { countryCallingCode, nationalNumber }];
  } catch (error: unknown) {
    if (error instanceof ParseError) {
      return [error];
    }
    throw error;
  }
};

const usePhoneNumber = (value: string, onChangeCallback: (value: string) => void) => {
  // TODO: phoneNumber format based on country

  const [phoneNumber, setPhoneNumber] = useState<PhoneNumberState>({
    countryCallingCode: defaultCountryCallingCode,
    nationalNumber: '',
    interacted: false,
  });
  const [error, setError] = useState<ParseError>();

  useEffect(() => {
    // Only run on data initialization
    if (phoneNumber.interacted) {
      return;
    }

    const [parseError, result] = parsePhoneNumber(value);
    setError(parseError);

    if (result) {
      const { countryCallingCode, nationalNumber } = result;
      setPhoneNumber((previous) => ({
        ...previous,
        countryCallingCode,
        nationalNumber,
      }));
    }
  }, [phoneNumber.interacted, value]);

  useEffect(() => {
    // Only run after data initialization
    if (!phoneNumber.interacted) {
      return;
    }

    const { countryCallingCode, nationalNumber } = phoneNumber;
    const [parseError] = parsePhoneNumber(`${countryCallingCode}${nationalNumber}`);
    setError(parseError);
    onChangeCallback(`+${countryCallingCode}${nationalNumber}`);
  }, [onChangeCallback, phoneNumber]);

  return {
    error,
    phoneNumber,
    setPhoneNumber,
  };
};

export default usePhoneNumber;
