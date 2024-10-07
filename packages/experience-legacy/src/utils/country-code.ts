import i18next from 'i18next';
import type { CountryCode, CountryCallingCode, E164Number } from 'libphonenumber-js/mobile';
import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberWithError,
} from 'libphonenumber-js/mobile';

export const fallbackCountryCode = 'US';

export const countryCallingCodeMap: Record<string, CountryCode> = {
  zh: 'CN',
  en: 'US',
};

export const isValidCountryCode = (countryCode: string): countryCode is CountryCode => {
  try {
    // Use getCountryCallingCode method to guard the input's value is in CountryCode union type, if type not match exceptions are expected
    // eslint-disable-next-line no-restricted-syntax
    getCountryCallingCode(countryCode as CountryCode);

    return true;
  } catch {
    return false;
  }
};

export const getDefaultCountryCode = (): CountryCode => {
  const { language } = i18next;

  // Extract the country code from language tag suffix
  const [languageCode, countryCode] = language.split('-');

  if (countryCode && isValidCountryCode(countryCode)) {
    return countryCode;
  }

  const upperCaseLanguageCode = languageCode?.toUpperCase();

  if (upperCaseLanguageCode && isValidCountryCode(upperCaseLanguageCode)) {
    return upperCaseLanguageCode;
  }

  return countryCallingCodeMap[language] ?? fallbackCountryCode;
};

export const getDefaultCountryCallingCode = () => getCountryCallingCode(getDefaultCountryCode());

/**
 * Provide Country Code Options
 */
export type CountryMetaData = {
  countryCode: CountryCode;
  countryCallingCode: CountryCallingCode;
};

export const getCountryList = (): CountryMetaData[] => {
  const defaultCountryCode = getDefaultCountryCode();
  const defaultCountryCallingCode = getCountryCallingCode(defaultCountryCode);

  const countryList = getCountries()
    .map((code) => ({
      countryCode: code,
      countryCallingCode: getCountryCallingCode(code),
    }))
    // Filter the detected default countryCode & duplicates
    .filter(({ countryCallingCode }, index, self) => {
      if (countryCallingCode === defaultCountryCallingCode) {
        return false;
      }

      return (
        self.findIndex((element) => element.countryCallingCode === countryCallingCode) === index
      );
    })
    .slice()
    // Sort by countryCallingCode
    .sort((previous, next) => (next.countryCallingCode > previous.countryCallingCode ? -1 : 1));

  return [
    {
      countryCode: defaultCountryCode,
      countryCallingCode: defaultCountryCallingCode,
    },
    ...countryList,
  ];
};

export const parseE164Number = (value: string): E164Number | '' => {
  if (!value || value.startsWith('+')) {
    return value;
  }

  return `+${value}`;
};

export const formatPhoneNumberWithCountryCallingCode = (number: string) => {
  try {
    const phoneNumber = parsePhoneNumberWithError(parseE164Number(number));

    return `+${phoneNumber.countryCallingCode} ${phoneNumber.nationalNumber}`;
  } catch {
    return number;
  }
};

export const parsePhoneNumber = (value: string) => {
  try {
    const phoneNumber = parsePhoneNumberWithError(parseE164Number(value));

    return {
      countryCallingCode: phoneNumber.countryCallingCode,
      nationalNumber: phoneNumber.nationalNumber,
    };
  } catch {}
};
