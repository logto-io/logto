import resource from '@logto/phrases-ui';
import type { CustomPhrase } from '@logto/schemas';
import deepmerge from 'deepmerge';

import {
  enTag,
  mockEnCustomPhrase,
  mockZhCnCustomPhrase,
  mockZhHkCustomPhrase,
  trTrTag,
  zhCnTag,
  zhHkTag,
} from '@/__mocks__/custom-phrase';
import RequestError from '@/errors/RequestError';
import { getPhrase } from '@/lib/phrase';

const englishBuiltInPhrase = resource[enTag];

const customOnlyLanguage = zhHkTag;
const customOnlyCustomPhrase = mockZhHkCustomPhrase;

const customizedLanguage = zhCnTag;
const customizedBuiltInPhrase = resource[zhCnTag];
const customizedCustomPhrase = mockZhCnCustomPhrase;

const mockCustomPhrases: Record<string, CustomPhrase> = {
  [enTag]: mockEnCustomPhrase,
  [customOnlyLanguage]: customOnlyCustomPhrase,
  [customizedLanguage]: customizedCustomPhrase,
};

const findCustomPhraseByLanguageTag = jest.fn(async (languageTag: string) => {
  const mockCustomPhrase = mockCustomPhrases[languageTag];

  if (!mockCustomPhrase) {
    throw new RequestError({ code: 'entity.not_found', status: 404 });
  }

  return mockCustomPhrase;
});

jest.mock('@/queries/custom-phrase', () => ({
  findCustomPhraseByLanguageTag: async (key: string) => findCustomPhraseByLanguageTag(key),
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
    languageTag: enTag,
    translation: {
      input: {
        ...resource.en.translation.input,
        ...mockTranslationInput,
        username: '',
        password: '',
      },
    },
  };

  findCustomPhraseByLanguageTag.mockResolvedValueOnce(mockEnCustomPhraseWithEmptyStringValues);
  await expect(getPhrase(enTag, [enTag])).resolves.toEqual(
    deepmerge(englishBuiltInPhrase, {
      languageTag: enTag,
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
    await expect(getPhrase(enTag, [enTag])).resolves.toEqual(
      deepmerge(englishBuiltInPhrase, mockEnCustomPhrase)
    );
  });

  it('should be English built-in phrase when its custom phrase does not exist', async () => {
    await expect(getPhrase(enTag, [])).resolves.toEqual(englishBuiltInPhrase);
  });
});

describe('when the language is not English', () => {
  it('should be custom phrase merged with built-in phrase when both of them exist', async () => {
    await expect(getPhrase(customizedLanguage, [customizedLanguage])).resolves.toEqual(
      deepmerge(customizedBuiltInPhrase, customizedCustomPhrase)
    );
  });

  it('should be built-in phrase when there is built-in phrase and no custom phrase', async () => {
    const builtInOnlyLanguage = trTrTag;
    const builtInOnlyPhrase = resource[trTrTag];
    await expect(getPhrase(builtInOnlyLanguage, [])).resolves.toEqual(builtInOnlyPhrase);
  });

  it('should be built-in phrase when there is custom phrase and no built-in phrase', async () => {
    await expect(getPhrase(customOnlyLanguage, [customOnlyLanguage])).resolves.toEqual(
      deepmerge(englishBuiltInPhrase, customOnlyCustomPhrase)
    );
  });
});
