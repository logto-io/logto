import resource from '@logto/phrases-ui';
import { CustomPhrase } from '@logto/schemas';
import deepmerge from 'deepmerge';

import {
  enTag,
  mockEnCustomPhrase,
  mockZhCnCustomPhrase,
  mockZhHkCustomPhrase,
  trTrTag,
  zhCnTag,
  zhHkTag,
} from '#src/__mocks__/custom-phrase.js';
import { wellKnownCache } from '#src/caches/well-known.js';
import RequestError from '#src/errors/RequestError/index.js';
import { MockQueries } from '#src/test-utils/tenant.js';

const { jest } = import.meta;

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

const tenantId = 'mock_id';
const { createPhraseLibrary } = await import('#src/libraries/phrase.js');
const { getPhrases } = createPhraseLibrary(
  new MockQueries({ customPhrases: { findCustomPhraseByLanguageTag } }),
  tenantId
);

afterEach(() => {
  wellKnownCache.invalidateAll(tenantId);
  jest.clearAllMocks();
});

it('should ignore empty string values from the custom phrase', async () => {
  const mockTranslationInput = {
    email: 'Email 3',
    phone_number: 'Phone number 4',
    confirm_password: 'Confirm password 5',
  };
  const mockEnCustomPhraseWithEmptyStringValues = {
    tenantId: 'fake_tenant',
    id: 'fake_id',
    languageTag: enTag,
    translation: {
      input: {
        ...resource.en.translation.input,
        ...mockTranslationInput,
        username: '',
        password: '',
      },
    },
  } satisfies CustomPhrase;

  findCustomPhraseByLanguageTag.mockResolvedValueOnce(mockEnCustomPhraseWithEmptyStringValues);
  await expect(getPhrases(enTag, [enTag])).resolves.toEqual(
    deepmerge(englishBuiltInPhrase, {
      id: 'fake_id',
      tenantId: 'fake_tenant',
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
    await expect(getPhrases(enTag, [enTag])).resolves.toEqual(
      deepmerge(englishBuiltInPhrase, mockEnCustomPhrase)
    );
  });

  it('should be English built-in phrase when its custom phrase does not exist', async () => {
    await expect(getPhrases(enTag, [])).resolves.toEqual(englishBuiltInPhrase);
  });
});

describe('when the language is not English', () => {
  it('should be custom phrase merged with built-in phrase when both of them exist', async () => {
    await expect(getPhrases(customizedLanguage, [customizedLanguage])).resolves.toEqual(
      deepmerge(customizedBuiltInPhrase, customizedCustomPhrase)
    );
  });

  it('should be built-in phrase when there is built-in phrase and no custom phrase', async () => {
    const builtInOnlyLanguage = trTrTag;
    const builtInOnlyPhrase = resource[trTrTag];
    await expect(getPhrases(builtInOnlyLanguage, [])).resolves.toEqual(builtInOnlyPhrase);
  });

  it('should be built-in phrase when there is custom phrase and no built-in phrase', async () => {
    await expect(getPhrases(customOnlyLanguage, [customOnlyLanguage])).resolves.toEqual(
      deepmerge(englishBuiltInPhrase, customOnlyCustomPhrase)
    );
  });
});
