import resource from '@logto/phrases-ui';
import { CustomPhrase } from '@logto/schemas';
import deepmerge from 'deepmerge';

import {
  enKey,
  mockEnCustomPhrase,
  mockZhCnCustomPhrase,
  mockZhHkCustomPhrase,
  trTrKey,
  zhCnKey,
  zhHkKey,
} from '@/__mocks__/custom-phrase';
import RequestError from '@/errors/RequestError';
import { getPhrase } from '@/lib/phrase';

const englishBuiltInPhrase = resource[enKey];

const customOnlyLanguage = zhHkKey;
const customOnlyCustomPhrase = mockZhHkCustomPhrase;

const customizedLanguage = zhCnKey;
const customizedBuiltInPhrase = resource[zhCnKey];
const customizedCustomPhrase = mockZhCnCustomPhrase;

const mockCustomPhrases: Record<string, CustomPhrase> = {
  [enKey]: mockEnCustomPhrase,
  [customOnlyLanguage]: customOnlyCustomPhrase,
  [customizedLanguage]: customizedCustomPhrase,
};

const findCustomPhraseByLanguageKey = jest.fn(async (languageKey: string) => {
  const mockCustomPhrase = mockCustomPhrases[languageKey];

  if (!mockCustomPhrase) {
    throw new RequestError({ code: 'entity.not_found', status: 404 });
  }

  return mockCustomPhrase;
});

jest.mock('@/queries/custom-phrase', () => ({
  findCustomPhraseByLanguageKey: async (key: string) => findCustomPhraseByLanguageKey(key),
}));

afterEach(() => {
  jest.clearAllMocks();
});

it('should ignore empty string values from the custom phrase', async () => {
  const mockTranslationInput = {
    email: 'Email 3',
    phone_number: 'Phone number 4',
    confirm_password: 'Confirm password 5',
  };
  const mockEnCustomPhraseWithEmptyStringValues = {
    languageKey: enKey,
    translation: {
      input: {
        ...resource.en.translation.input,
        ...mockTranslationInput,
        username: '',
        password: '',
      },
    },
  };

  findCustomPhraseByLanguageKey.mockResolvedValueOnce(mockEnCustomPhraseWithEmptyStringValues);
  await expect(getPhrase(enKey, [enKey])).resolves.toEqual(
    deepmerge(englishBuiltInPhrase, {
      languageKey: enKey,
      translation: {
        input: {
          ...resource.en.translation.input,
          ...mockTranslationInput,
        },
      },
    })
  );
});

describe('when the language is English', () => {
  it('should be English custom phrase merged with its built-in phrase when its custom phrase exists', async () => {
    await expect(getPhrase(enKey, [enKey])).resolves.toEqual(
      deepmerge(englishBuiltInPhrase, mockEnCustomPhrase)
    );
  });

  it('should be English built-in phrase when its custom phrase does not exist', async () => {
    await expect(getPhrase(enKey, [])).resolves.toEqual(englishBuiltInPhrase);
  });
});

describe('when the language is not English', () => {
  it('should be custom phrase merged with built-in phrase when both of them exist', async () => {
    await expect(getPhrase(customizedLanguage, [customizedLanguage])).resolves.toEqual(
      deepmerge(customizedBuiltInPhrase, customizedCustomPhrase)
    );
  });

  it('should be built-in phrase when there is built-in phrase and no custom phrase', async () => {
    const builtInOnlyLanguage = trTrKey;
    const builtInOnlyPhrase = resource[trTrKey];
    await expect(getPhrase(builtInOnlyLanguage, [])).resolves.toEqual(builtInOnlyPhrase);
  });

  it('should be built-in phrase when there is custom phrase and no built-in phrase', async () => {
    await expect(getPhrase(customOnlyLanguage, [customOnlyLanguage])).resolves.toEqual(
      deepmerge(englishBuiltInPhrase, customOnlyCustomPhrase)
    );
  });
});
