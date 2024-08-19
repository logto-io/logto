import en from '@logto/phrases-experience/lib/locales/en/index.js';
import type { SignInExperience } from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';

import { trTrTag, zhCnTag, mockTag } from '#src/__mocks__/custom-phrase.js';
import { mockSignInExperience } from '#src/__mocks__/index.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const fallbackLanguage = trTrTag;
const unsupportedLanguageX = 'xx-XX';
const unsupportedLanguageY = 'yy-YY';

const findDefaultSignInExperience = jest.fn(
  async (): Promise<SignInExperience> => ({
    ...mockSignInExperience,
    languageInfo: {
      autoDetect: true,
      fallbackLanguage,
    },
  })
);

const tenantContext = new MockTenant(
  undefined,
  {
    customPhrases: { findAllCustomLanguageTags: async () => [trTrTag, zhCnTag] },
    signInExperiences: { findDefaultSignInExperience },
  },
  undefined,
  { phrases: { getPhrases: jest.fn().mockResolvedValue(en) } }
);

const phraseRoutes = await pickDefault(import('./index.js'));

const phraseRequest = createRequester({
  anonymousRoutes: phraseRoutes,
  tenantContext,
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
        // @ts-expect-error
        fallbackLanguage: unsupportedLanguageX,
      },
    });
    const response = await phraseRequest
      .get('/.well-known/phrases')
      .set('Accept-Language', `${zhCnTag},${mockTag}`);
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
      const response = await phraseRequest.get('/.well-known/phrases');
      expect(response.headers['content-language']).toEqual(fallbackLanguage);
    });

    it('when there are detected languages', async () => {
      const response = await phraseRequest
        .get('/.well-known/phrases')
        .set('Accept-Language', `${zhCnTag},${mockTag}`);
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
        // @ts-expect-error
        fallbackLanguage: unsupportedLanguageX,
      },
    });
    const response = await phraseRequest
      .get('/.well-known/phrases')
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
        const response = await phraseRequest.get('/.well-known/phrases');
        expect(response.headers['content-language']).toEqual(fallbackLanguage);
      });
    });

    describe('when there are detected languages but all of them is unsupported', () => {
      it('should be first supported detected language', async () => {
        const response = await phraseRequest
          .get('/.well-known/phrases')
          .set('Accept-Language', `${unsupportedLanguageX},${unsupportedLanguageY}`);
        expect(response.headers['content-language']).toEqual(fallbackLanguage);
      });
    });

    describe('when there are detected languages but some of them is unsupported', () => {
      it('should be first supported detected language', async () => {
        const firstSupportedLanguage = zhCnTag;
        const response = await phraseRequest
          .get('/.well-known/phrases')
          .set('Accept-Language', `${unsupportedLanguageX},${firstSupportedLanguage},${mockTag}`);
        expect(response.headers['content-language']).toEqual(firstSupportedLanguage);
      });
    });
  });
});
