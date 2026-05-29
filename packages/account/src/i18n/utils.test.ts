import { getPreferredLanguage } from './utils';

describe('i18n utils', () => {
  afterEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  it('getPreferredLanguage returns raw ui_locales for server-side resolution', () => {
    expect(
      getPreferredLanguage({
        uiLocales: 'vi-VN',
        languageSettings: {
          autoDetect: false,
          fallbackLanguage: 'fr',
        },
      })
    ).toBe('vi-VN');
  });

  it('getPreferredLanguage respects ui_locales before language settings', () => {
    expect(
      getPreferredLanguage({
        uiLocales: 'xx pl',
        languageSettings: {
          autoDetect: false,
          fallbackLanguage: 'fr',
        },
      })
    ).toBe('xx pl');
  });

  it('getPreferredLanguage uses fallback language when auto-detect is disabled', () => {
    expect(
      getPreferredLanguage({
        languageSettings: {
          autoDetect: false,
          fallbackLanguage: 'vi-VN',
        },
      })
    ).toBe('vi-VN');
  });

  it('getPreferredLanguage does not pin lng when auto-detect is enabled', () => {
    jest.spyOn(navigator, 'languages', 'get').mockReturnValue(['fr']);
    jest.spyOn(navigator, 'language', 'get').mockReturnValue('fr');

    localStorage.setItem('i18nextAccountCenterLng', 'zh-CN');
    localStorage.setItem('i18nextLogtoUiLng', 'en-US');

    expect(
      getPreferredLanguage({
        languageSettings: {
          autoDetect: true,
          fallbackLanguage: 'fr',
        },
      })
    ).toBeUndefined();
  });
});
