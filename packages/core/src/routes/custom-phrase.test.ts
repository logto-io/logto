import { CustomPhrase } from '@logto/schemas';

import RequestError from '@/errors/RequestError';
import phraseRoutes from '@/routes/custom-phrase';
import { createRequester } from '@/utils/test-utils';

const mockLanguageKey = 'en-US';

const mockCustomPhrases: Record<string, CustomPhrase> = {
  [mockLanguageKey]: {
    languageKey: mockLanguageKey,
    translation: {
      input: {
        username: 'Username',
        password: 'Password',
        email: 'Email',
        phone_number: 'Phone number',
        confirm_password: 'Confirm password',
      },
    },
  },
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

describe('customPhraseRoutes', () => {
  const phraseRequest = createRequester({ authedRoutes: phraseRoutes });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /custom-phrases/:languageKey', () => {
    it('should call findCustomPhraseByLanguageKey once', async () => {
      await phraseRequest.get(`/custom-phrases/${mockLanguageKey}`);
      expect(findCustomPhraseByLanguageKey).toBeCalledTimes(1);
    });

    it('should return the specified custom phrase existing in the database', async () => {
      const response = await phraseRequest.get(`/custom-phrases/${mockLanguageKey}`);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual(mockCustomPhrases[mockLanguageKey]);
    });

    it('should return 404 status code when there is no specified custom phrase in the database', async () => {
      const response = await phraseRequest.get('/custom-phrases/en-UK');
      expect(response.status).toEqual(404);
    });
  });
});
