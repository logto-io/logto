import en from '@logto/phrases-ui/lib/locales/en.js';
import type { CustomPhrase, SignInExperience, Translation } from '@logto/schemas';

import { mockZhCnCustomPhrase, trTrTag, zhCnTag } from '#src/__mocks__/custom-phrase.js';
import { mockSignInExperience } from '#src/__mocks__/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import customPhraseRoutes from '#src/routes/custom-phrase.js';
import { createRequester } from '#src/utils/test-utils.js';

const mockLanguageTag = zhCnTag;
const mockPhrase = mockZhCnCustomPhrase;
const mockCustomPhrases: Record<string, CustomPhrase> = {
  [mockLanguageTag]: mockPhrase,
};

const deleteCustomPhraseByLanguageTag = jest.fn(async (languageTag: string) => {
  if (!mockCustomPhrases[languageTag]) {
    throw new RequestError({ code: 'entity.not_found', status: 404 });
  }
});

const findCustomPhraseByLanguageTag = jest.fn(async (languageTag: string) => {
  const mockCustomPhrase = mockCustomPhrases[languageTag];

  if (!mockCustomPhrase) {
    throw new RequestError({ code: 'entity.not_found', status: 404 });
  }

  return mockCustomPhrase;
});

const findAllCustomPhrases = jest.fn(async (): Promise<CustomPhrase[]> => []);

const upsertCustomPhrase = jest.fn(async (customPhrase: CustomPhrase) => mockPhrase);

jest.mock('#src/queries/custom-phrase.js', () => ({
  deleteCustomPhraseByLanguageTag: async (tag: string) => deleteCustomPhraseByLanguageTag(tag),
  findAllCustomPhrases: async () => findAllCustomPhrases(),
  findCustomPhraseByLanguageTag: async (tag: string) => findCustomPhraseByLanguageTag(tag),
  upsertCustomPhrase: async (customPhrase: CustomPhrase) => upsertCustomPhrase(customPhrase),
}));

const isStrictlyPartial = jest.fn(
  (fullTranslation: Translation, partialTranslation: Partial<Translation>) => true
);

jest.mock('#src/utils/translation.js', () => ({
  isStrictlyPartial: (fullTranslation: Translation, partialTranslation: Translation) =>
    isStrictlyPartial(fullTranslation, partialTranslation),
}));

const mockFallbackLanguage = trTrTag;

const findDefaultSignInExperience = jest.fn(
  async (): Promise<SignInExperience> => ({
    ...mockSignInExperience,
    languageInfo: {
      autoDetect: true,
      fallbackLanguage: mockFallbackLanguage,
    },
  })
);

jest.mock('#src/queries/sign-in-experience.js', () => ({
  findDefaultSignInExperience: async () => findDefaultSignInExperience(),
}));

describe('customPhraseRoutes', () => {
  const customPhraseRequest = createRequester({ authedRoutes: customPhraseRoutes });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /custom-phrases', () => {
    it('should call findAllCustomPhrases', async () => {
      await customPhraseRequest.get('/custom-phrases');
      expect(findAllCustomPhrases).toBeCalledTimes(1);
    });

    it('should return all custom phrases', async () => {
      const mockCustomPhrase = {
        languageTag: 'zh-HK',
        translation: {
          input: { username: '用戶名', password: '密碼' },
        },
      };
      findAllCustomPhrases.mockImplementationOnce(async () => [mockCustomPhrase]);
      const response = await customPhraseRequest.get('/custom-phrases');
      expect(response.status).toEqual(200);
      expect(response.body).toEqual([mockCustomPhrase]);
    });
  });

  describe('GET /custom-phrases/:languageTag', () => {
    it('should call findCustomPhraseByLanguageTag once', async () => {
      await customPhraseRequest.get(`/custom-phrases/${mockLanguageTag}`);
      expect(findCustomPhraseByLanguageTag).toBeCalledTimes(1);
    });

    it('should return the specified custom phrase existing in the database', async () => {
      const response = await customPhraseRequest.get(`/custom-phrases/${mockLanguageTag}`);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual(mockCustomPhrases[mockLanguageTag]);
    });

    it('should return 404 status code when there is no specified custom phrase in the database', async () => {
      const response = await customPhraseRequest.get('/custom-phrases/en-GB');
      expect(response.status).toEqual(404);
    });

    it('should return 400 status code when the language tag is invalid', async () => {
      const invalidLanguageTag = 'xx-XX';
      const response = await customPhraseRequest.get(`/custom-phrases/${invalidLanguageTag}`);
      expect(response.status).toEqual(400);
    });
  });

  describe('PUT /custom-phrases/:languageTag', () => {
    const translation = mockCustomPhrases[mockLanguageTag]?.translation;

    it('should remove empty strings', async () => {
      const inputTranslation = { username: '用户名 1' };
      await customPhraseRequest.put(`/custom-phrases/${mockLanguageTag}`).send({
        input: { ...inputTranslation, password: '' },
      });
      expect(upsertCustomPhrase).toBeCalledWith({
        languageTag: mockLanguageTag,
        translation: { input: inputTranslation },
      });
    });

    it('should call isStrictlyPartial', async () => {
      await customPhraseRequest.put(`/custom-phrases/${mockLanguageTag}`).send(translation);
      expect(isStrictlyPartial).toBeCalledWith(en.translation, translation);
    });

    it('should fail when the input translation structure is invalid', async () => {
      isStrictlyPartial.mockReturnValueOnce(false);
      const response = await customPhraseRequest
        .put(`/custom-phrases/${mockLanguageTag}`)
        .send(translation);
      expect(response.status).toEqual(400);
    });

    it('should call upsertCustomPhrase with specified language tag', async () => {
      await customPhraseRequest.put(`/custom-phrases/${mockLanguageTag}`).send(translation);
      expect(upsertCustomPhrase).toBeCalledWith(mockCustomPhrases[mockLanguageTag]);
    });

    it('should return custom phrase after upserting', async () => {
      const response = await customPhraseRequest
        .put(`/custom-phrases/${mockLanguageTag}`)
        .send(translation);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual(mockCustomPhrases[mockLanguageTag]);
    });

    it('should return 400 status code when the language tag is invalid', async () => {
      const invalidLanguageTag = 'xx-XX';
      const response = await customPhraseRequest
        .put(`/custom-phrases/${invalidLanguageTag}`)
        .send(mockCustomPhrases[mockLanguageTag]?.translation);
      expect(response.status).toEqual(400);
    });
  });

  describe('DELETE /custom-phrases/:languageTag', () => {
    it('should call deleteCustomPhraseByLanguageTag when custom phrase exists and is not fallback language in sign-in experience', async () => {
      await customPhraseRequest.delete(`/custom-phrases/${mockLanguageTag}`);
      expect(deleteCustomPhraseByLanguageTag).toBeCalledWith(mockLanguageTag);
    });

    it('should return 204 status code after deleting specified custom phrase', async () => {
      const response = await customPhraseRequest.delete(`/custom-phrases/${mockLanguageTag}`);
      expect(response.status).toEqual(204);
    });

    it('should return 404 status code when specified custom phrase does not exist before deleting', async () => {
      const response = await customPhraseRequest.delete('/custom-phrases/en-GB');
      expect(response.status).toEqual(404);
    });

    it('should return 400 status code when specified custom phrase is used as fallback language in sign-in experience', async () => {
      const response = await customPhraseRequest.delete(`/custom-phrases/${mockFallbackLanguage}`);
      expect(response.status).toEqual(400);
    });

    it('should return 400 status code when the language tag is invalid', async () => {
      const invalidLanguageTag = 'xx-XX';
      const response = await customPhraseRequest.delete(`/custom-phrases/${invalidLanguageTag}`);
      expect(response.status).toEqual(400);
    });
  });
});
