import i18next from 'i18next';
import {
  getCountries,
  CountryCode,
  CountryCallingCode,
  getCountryCallingCode,
} from 'libphonenumber-js';

export const fallbackCountryCode = 'US';

export const countryCallingCodeMap: Record<string, CountryCode> = {
  zh: 'CN',
  en: 'US',
};

export const isValidCountryCode = (countryCode: string) => {
  try {
    getCountryCallingCode(countryCode as CountryCode);

    return true;
  } catch {
    return false;
  }
};

export const getDefaultCountryCode = (): CountryCode => {
  const { language } = i18next;
  const detectedCountryCode = countryCallingCodeMap[language];

  // Extract the country code from language tag suffix
  const [, countryCode] = language.split('-');

  if (countryCode && isValidCountryCode(countryCode)) {
    return countryCode as CountryCode;
  }

  return detectedCountryCode ?? fallbackCountryCode;
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

  // eslint-disable-next-line @silverhand/fp/no-mutating-methods
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
