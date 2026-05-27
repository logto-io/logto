import type { LocalePhrase } from '@logto/phrases-experience';
import { type DeepPartial } from '@silverhand/essentials';
import i18next from 'i18next';

import { getPhrases as getPhrasesApi } from '@ac/apis/phrases';
import { getUiLocales } from '@ac/utils/account-center-route';

import { changeLanguage, getI18nResource } from './utils';

jest.mock('@ac/apis/phrases', () => ({
  getPhrases: jest.fn(),
}));

jest.mock('@ac/utils/account-center-route', () => ({
  getUiLocales: jest.fn(),
}));

const getPhrasesApiMock = jest.mocked(getPhrasesApi);
const getUiLocalesMock = jest.mocked(getUiLocales);

const customLanguageTag = 'vi-VN';
const customConfirmLabel = 'custom-vi-confirm';

const mockRemotePhrases: DeepPartial<LocalePhrase> = {
  translation: {
    action: {
      confirm: customConfirmLabel,
    },
  },
};

const createPhrasesResponse = (
  lng: string,
  phrases: DeepPartial<LocalePhrase> = mockRemotePhrases
) => ({
  json: async () => phrases as LocalePhrase,
  headers: {
    get: (name: string) => (name.toLowerCase() === 'content-language' ? lng : null),
  },
});

describe('account center phrase loading', () => {
  beforeEach(() => {
    getUiLocalesMock.mockImplementation((): string | undefined => undefined);
    getPhrasesApiMock.mockResolvedValue(
      createPhrasesResponse(customLanguageTag) as Awaited<ReturnType<typeof getPhrasesApi>>
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('getI18nResource uses Content-Language and returned phrase bundle', async () => {
    const { resources, lng } = await getI18nResource(customLanguageTag);

    expect(lng).toBe(customLanguageTag);
    expect(resources[customLanguageTag]).toMatchObject(mockRemotePhrases);
    expect(getPhrasesApiMock).toHaveBeenCalledWith(
      expect.objectContaining({
        language: customLanguageTag,
      })
    );
  });

  it('changeLanguage registers remote bundles and switches i18next language', async () => {
    const addResourceBundleSpy = jest.spyOn(i18next, 'addResourceBundle');
    const changeLanguageSpy = jest.spyOn(i18next, 'changeLanguage');

    await changeLanguage(customLanguageTag);

    expect(addResourceBundleSpy).toHaveBeenCalledWith(
      customLanguageTag,
      'translation',
      mockRemotePhrases.translation
    );
    expect(changeLanguageSpy).toHaveBeenCalledWith(customLanguageTag);

    addResourceBundleSpy.mockRestore();
    changeLanguageSpy.mockRestore();
  });

  it('getI18nResource falls back to built-in English when phrase loading fails', async () => {
    getPhrasesApiMock.mockRejectedValueOnce(new Error('network error'));

    const { resources, lng } = await getI18nResource(customLanguageTag);

    expect(lng).toBe('en');
    expect(resources.en).toBeDefined();
  });
});
