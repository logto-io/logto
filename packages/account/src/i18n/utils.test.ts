import { getPreferredLanguage, resolveLanguage, resolveUiLocalesLanguage } from './utils';

describe('i18n utils', () => {
  afterEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  it('resolveLanguage returns the best supported built-in language', () => {
    expect(resolveLanguage('pl')).toBe('pl-PL');
    expect(resolveLanguage('zh-HK')).toBe('zh-HK');
    expect(resolveLanguage('xx')).toBeUndefined();
  });

  it('resolveUiLocalesLanguage returns the first supported locale with fallback support', () => {
    expect(resolveUiLocalesLanguage('xx pl fr')).toBe('pl-PL');
    expect(resolveUiLocalesLanguage('zh-HK zh')).toBe('zh-HK');
    expect(resolveUiLocalesLanguage('xx yy')).toBeUndefined();
  });

  it('getPreferredLanguage respects ui_locales fallback before language settings', () => {
    expect(
      getPreferredLanguage({
        uiLocales: 'xx pl',
        languageSettings: {
          autoDetect: false,
          fallbackLanguage: 'fr',
        },
      })
    ).toBe('pl-PL');
  });

  it('getPreferredLanguage uses the shared SIE language source when auto detecting', () => {
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
    ).toBe('en');
  });
});
