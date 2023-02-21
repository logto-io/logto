import i18next from 'i18next';

import {
  isValidCountryCode,
  getDefaultCountryCode,
  getDefaultCountryCallingCode,
  getCountryList,
  formatPhoneNumberWithCountryCallingCode,
} from './country-code';

describe('country-code', () => {
  void i18next.init();

  it('isValidCountryCode', () => {
    expect(isValidCountryCode('CN')).toBeTruthy();
    expect(isValidCountryCode('xy')).toBeFalsy();
  });

  it('getDefaultCountryCode', async () => {
    await i18next.changeLanguage('zh');

    expect(getDefaultCountryCode()).toEqual('CN');

    await i18next.changeLanguage('en');
    expect(getDefaultCountryCode()).toEqual('US');

    await i18next.changeLanguage('zh-CN');
    expect(getDefaultCountryCode()).toEqual('CN');

    await i18next.changeLanguage('zh-TW');
    expect(getDefaultCountryCode()).toEqual('TW');

    await i18next.changeLanguage('en-US');
    expect(getDefaultCountryCode()).toEqual('US');

    await i18next.changeLanguage('en-CA');
    expect(getDefaultCountryCode()).toEqual('CA');

    await i18next.changeLanguage('ru');
    expect(getDefaultCountryCode()).toEqual('RU');
  });

  it('getDefaultCountryCallingCode', async () => {
    await i18next.changeLanguage('zh');
    expect(getDefaultCountryCallingCode()).toEqual('86');

    await i18next.changeLanguage('en');
    expect(getDefaultCountryCallingCode()).toEqual('1');

    await i18next.changeLanguage('zh-CN');
    expect(getDefaultCountryCallingCode()).toEqual('86');

    await i18next.changeLanguage('zh-TW');
    expect(getDefaultCountryCallingCode()).toEqual('886');

    await i18next.changeLanguage('en-US');
    expect(getDefaultCountryCallingCode()).toEqual('1');

    await i18next.changeLanguage('en-CA');
    expect(getDefaultCountryCallingCode()).toEqual('1');

    await i18next.changeLanguage('ru');
    expect(getDefaultCountryCallingCode()).toEqual('7');
  });

  it('getCountryList should sort properly', async () => {
    await i18next.changeLanguage('zh');
    const countryList = getCountryList();

    expect(countryList[0]).toEqual({
      countryCode: 'CN',
      countryCallingCode: '86',
    });

    expect(countryList[1]?.countryCallingCode).toEqual('1');
  });

  it('getCountryList should remove duplicate', async () => {
    await i18next.changeLanguage('zh');
    const countryList = getCountryList();

    expect(countryList.filter(({ countryCallingCode }) => countryCallingCode === '1')).toHaveLength(
      1
    );
    expect(countryList[0]?.countryCallingCode).toEqual('86');
  });

  it('formatPhoneNumberWithCountryCallingCode', async () => {
    expect(formatPhoneNumberWithCountryCallingCode('18888888888')).toBe('+1 8888888888');
    expect(formatPhoneNumberWithCountryCallingCode('8618888888888')).toBe('+86 18888888888');
  });
});
