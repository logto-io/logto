import en from '@logto/phrases-ui/lib/locales/en';
import { Provider } from 'oidc-provider';

import { mockSignInExperience } from '@/__mocks__';
import { trTrKey, zhCnKey, zhHkKey } from '@/__mocks__/custom-phrase';
import phraseRoutes from '@/routes/phrase';
import { createRequester } from '@/utils/test-utils';

const mockApplicationId = 'mockApplicationIdValue';

const interactionDetails: jest.MockedFunction<() => Promise<unknown>> = jest.fn(async () => ({
  params: { client_id: mockApplicationId },
}));

jest.mock('oidc-provider', () => ({
  Provider: jest.fn(() => ({
    interactionDetails,
  })),
}));

const fallbackLanguage = trTrKey;
const unsupportedLanguageX = 'xx-XX';
const unsupportedLanguageY = 'yy-YY';

const findDefaultSignInExperience = jest.fn(async () => ({
  ...mockSignInExperience,
  languageInfo: {
    autoDetect: true,
    fallbackLanguage,
    fixedLanguage: fallbackLanguage,
  },
}));

jest.mock('@/queries/sign-in-experience', () => ({
  findDefaultSignInExperience: async () => findDefaultSignInExperience(),
}));

jest.mock('@/queries/custom-phrase', () => ({
  findAllCustomLanguageKeys: async () => [trTrKey, zhCnKey],
}));

jest.mock('@/lib/phrase', () => ({
  ...jest.requireActual('@/lib/phrase'),
  getPhrase: jest.fn().mockResolvedValue(en),
}));

const phraseRequest = createRequester({
  anonymousRoutes: phraseRoutes,
  provider: new Provider(''),
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('when auto-detect is not enabled', () => {
  it('should be English when fallback language is unsupported', async () => {
    findDefaultSignInExperience.mockResolvedValueOnce({
      ...mockSignInExperience,
      languageInfo: {
        autoDetect: false,
        fallbackLanguage: unsupportedLanguageX,
        fixedLanguage: unsupportedLanguageX,
      },
    });
    const response = await phraseRequest
      .get('/phrase')
      .set('Accept-Language', `${zhCnKey},${zhHkKey}`);
    expect(response.headers['content-language']).toEqual('en');
  });

  describe('should be fallback language', () => {
    beforeEach(() => {
      findDefaultSignInExperience.mockResolvedValueOnce({
        ...mockSignInExperience,
        languageInfo: {
          autoDetect: false,
          fallbackLanguage,
          fixedLanguage: fallbackLanguage,
        },
      });
    });

    it('when there is no detected language', async () => {
      const response = await phraseRequest.get('/phrase');
      expect(response.headers['content-language']).toEqual(fallbackLanguage);
    });

    it('when there are detected languages', async () => {
      const response = await phraseRequest
        .get('/phrase')
        .set('Accept-Language', `${zhCnKey},${zhHkKey}`);
      expect(response.headers['content-language']).toEqual(fallbackLanguage);
    });
  });
});

describe('when auto-detect is enabled', () => {
  it('should be English when fallback language is unsupported', async () => {
    findDefaultSignInExperience.mockResolvedValueOnce({
      ...mockSignInExperience,
      languageInfo: {
        autoDetect: true,
        fallbackLanguage: unsupportedLanguageX,
        fixedLanguage: unsupportedLanguageX,
      },
    });
    const response = await phraseRequest
      .get('/phrase')
      .set('Accept-Language', unsupportedLanguageY);
    expect(response.headers['content-language']).toEqual('en');
  });

  describe('when fallback language is supported', () => {
    beforeEach(() => {
      findDefaultSignInExperience.mockResolvedValueOnce({
        ...mockSignInExperience,
        languageInfo: {
          autoDetect: true,
          fallbackLanguage,
          fixedLanguage: fallbackLanguage,
        },
      });
    });

    describe('when there is no detected language', () => {
      it('should be fallback language from sign-in experience', async () => {
        const response = await phraseRequest.get('/phrase');
        expect(response.headers['content-language']).toEqual(fallbackLanguage);
      });
    });

    describe('when there are detected languages but all of them is unsupported', () => {
      it('should be first supported detected language', async () => {
        const response = await phraseRequest
          .get('/phrase')
          .set('Accept-Language', `${unsupportedLanguageX},${unsupportedLanguageY}`);
        expect(response.headers['content-language']).toEqual(fallbackLanguage);
      });
    });

    describe('when there are detected languages but some of them is unsupported', () => {
      it('should be first supported detected language', async () => {
        const firstSupportedLanguage = zhCnKey;
        const response = await phraseRequest
          .get('/phrase')
          .set('Accept-Language', `${unsupportedLanguageX},${firstSupportedLanguage},${zhHkKey}`);
        expect(response.headers['content-language']).toEqual(firstSupportedLanguage);
      });
    });
  });
});
