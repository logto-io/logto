/**
 * Provide PhoneNumber Format support
 * Reference [libphonenumber-js](https://gitlab.com/catamphetamine/libphonenumber-js)
 */

import {
  parsePhoneNumberWithError,
  CountryCallingCode,
  ParseError,
  CountryCode,
} from 'libphonenumber-js/mobile';
import { useState } from 'react';

import {
  getDefaultCountryCallingCode,
  getCountryList,
  parseE164Number,
} from '@/utils/country-code';

export type { CountryCallingCode } from 'libphonenumber-js/mobile';

export type CountryMetaData = {
  countryCode: CountryCode;
  countryCallingCode: CountryCallingCode;
};

type PhoneNumberData = {
  countryCallingCode: string;
  nationalNumber: string;
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

const usePhoneNumber = () => {
  const [phoneNumber, setPhoneNumber] = useState<PhoneNumberData>({
    countryCallingCode: getDefaultCountryCallingCode(),
    nationalNumber: '',
  });

  return {
    countryList: getCountryList(),
    phoneNumber,
    setPhoneNumber,
    isValidPhoneNumber,
  };
};

export default usePhoneNumber;
