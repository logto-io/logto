import en from '@logto/phrases-ui/lib/locales/en.js';
import { mockEsmWithActual, pickDefault } from '@logto/shared/esm';

import { trTrTag, zhCnTag, zhHkTag } from '#src/__mocks__/custom-phrase.js';
import { mockSignInExperience } from '#src/__mocks__/index.js';
import { createMockProvider } from '#src/test-utils/oidc-provider.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const fallbackLanguage = trTrTag;
const unsupportedLanguageX = 'xx-XX';
const unsupportedLanguageY = 'yy-YY';

const { findDefaultSignInExperience } = await mockEsmWithActual(
  '#src/queries/sign-in-experience.js',
  () => ({
    findDefaultSignInExperience: jest.fn(async () => ({
      ...mockSignInExperience,
      languageInfo: {
        autoDetect: true,
        fallbackLanguage,
      },
    })),
  })
);

await mockEsmWithActual('#src/queries/custom-phrase.js', () => ({
  findAllCustomLanguageTags: async () => [trTrTag, zhCnTag],
}));

await mockEsmWithActual('#src/lib/phrase.js', () => ({
  getPhrase: jest.fn().mockResolvedValue(en),
}));
const phraseRoutes = await pickDefault(import('./phrase.js'));

const phraseRequest = createRequester({
  anonymousRoutes: phraseRoutes,
  provider: createMockProvider(),
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
      },
    });
    const response = await phraseRequest
      .get('/phrase')
      .set('Accept-Language', `${zhCnTag},${zhHkTag}`);
    expect(response.headers['content-language']).toEqual('en');
  });

  describe('should be fallback language', () => {
    beforeEach(() => {
      findDefaultSignInExperience.mockResolvedValueOnce({
        ...mockSignInExperience,
        languageInfo: {
          autoDetect: false,
          fallbackLanguage,
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
        .set('Accept-Language', `${zhCnTag},${zhHkTag}`);
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
        const firstSupportedLanguage = zhCnTag;
        const response = await phraseRequest
          .get('/phrase')
          .set('Accept-Language', `${unsupportedLanguageX},${firstSupportedLanguage},${zhHkTag}`);
        expect(response.headers['content-language']).toEqual(firstSupportedLanguage);
      });
    });
  });
});
