import { CustomPhrase, SignInExperience } from '@logto/schemas';

import { mockSignInExperience } from '@/__mocks__';
import { mockZhCnCustomPhrase, trTrKey, zhCnKey } from '@/__mocks__/custom-phrase';
import RequestError from '@/errors/RequestError';
import customPhraseRoutes from '@/routes/custom-phrase';
import { createRequester } from '@/utils/test-utils';

const mockLanguageKey = zhCnKey;
const mockPhrase = mockZhCnCustomPhrase;
const mockCustomPhrases: Record<string, CustomPhrase> = {
  [mockLanguageKey]: mockPhrase,
};

const deleteCustomPhraseByLanguageKey = jest.fn(async (languageKey: string) => {
  if (!mockCustomPhrases[languageKey]) {
    throw new RequestError({ code: 'entity.not_found', status: 404 });
  }
});

const findCustomPhraseByLanguageKey = jest.fn(async (languageKey: string) => {
  const mockCustomPhrase = mockCustomPhrases[languageKey];

  if (!mockCustomPhrase) {
    throw new RequestError({ code: 'entity.not_found', status: 404 });
  }

  return mockCustomPhrase;
});

const findAllCustomPhrases = jest.fn(async (): Promise<CustomPhrase[]> => []);

const upsertCustomPhrase = jest.fn(async (customPhrase: CustomPhrase) => mockPhrase);

jest.mock('@/queries/custom-phrase', () => ({
  deleteCustomPhraseByLanguageKey: async (key: string) => deleteCustomPhraseByLanguageKey(key),
  findAllCustomPhrases: async () => findAllCustomPhrases(),
  findCustomPhraseByLanguageKey: async (key: string) => findCustomPhraseByLanguageKey(key),
  upsertCustomPhrase: async (customPhrase: CustomPhrase) => upsertCustomPhrase(customPhrase),
}));

const mockFallbackLanguage = trTrKey;

const findDefaultSignInExperience = jest.fn(
  async (): Promise<SignInExperience> => ({
    ...mockSignInExperience,
    languageInfo: {
      autoDetect: true,
      fallbackLanguage: mockFallbackLanguage,
      fixedLanguage: mockFallbackLanguage,
    },
  })
);

jest.mock('@/queries/sign-in-experience', () => ({
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
        languageKey: 'zh-HK',
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

  describe('GET /custom-phrases/:languageKey', () => {
    it('should call findCustomPhraseByLanguageKey once', async () => {
      await customPhraseRequest.get(`/custom-phrases/${mockLanguageKey}`);
      expect(findCustomPhraseByLanguageKey).toBeCalledTimes(1);
    });

    it('should return the specified custom phrase existing in the database', async () => {
      const response = await customPhraseRequest.get(`/custom-phrases/${mockLanguageKey}`);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual(mockCustomPhrases[mockLanguageKey]);
    });

    it('should return 404 status code when there is no specified custom phrase in the database', async () => {
      const response = await customPhraseRequest.get('/custom-phrases/en-UK');
      expect(response.status).toEqual(404);
    });
  });

  describe('PUT /custom-phrases/:languageKey', () => {
    it('should call upsertCustomPhrase with specified language key', async () => {
      await customPhraseRequest
        .put(`/custom-phrases/${mockLanguageKey}`)
        .send(mockCustomPhrases[mockLanguageKey]?.translation);
      expect(upsertCustomPhrase).toBeCalledWith(mockCustomPhrases[mockLanguageKey]);
    });

    it('should return custom phrase after upserting', async () => {
      const response = await customPhraseRequest
        .put(`/custom-phrases/${mockLanguageKey}`)
        .send(mockCustomPhrases[mockLanguageKey]?.translation);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual(mockCustomPhrases[mockLanguageKey]);
    });
  });

  describe('DELETE /custom-phrases/:languageKey', () => {
    it('should call deleteCustomPhraseByLanguageKey when custom phrase exists and is not fallback language in sign-in experience', async () => {
      await customPhraseRequest.delete(`/custom-phrases/${mockLanguageKey}`);
      expect(deleteCustomPhraseByLanguageKey).toBeCalledWith(mockLanguageKey);
    });

    it('should return 204 status code after deleting specified custom phrase', async () => {
      const response = await customPhraseRequest.delete(`/custom-phrases/${mockLanguageKey}`);
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
  });
});
