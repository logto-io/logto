import en from '@logto/phrases-ui/lib/locales/en';
import koKR from '@logto/phrases-ui/lib/locales/ko-kr';
import trTR from '@logto/phrases-ui/lib/locales/tr-tr';
import zhCN from '@logto/phrases-ui/lib/locales/zh-cn';
import { CustomPhrase } from '@logto/schemas';
import deepmerge from 'deepmerge';
import { Provider } from 'oidc-provider';

import { mockSignInExperience } from '@/__mocks__';
import RequestError from '@/errors/RequestError';
import * as signInExperienceQueries from '@/queries/sign-in-experience';
import phraseRoutes from '@/routes/phrase';
import { createRequester } from '@/utils/test-utils';

const enKey = 'en';
const koKrKey = 'ko-KR';
const ptPtKey = 'pt-PT';
const trTrKey = 'tr-TR';
const zhCnKey = 'zh-CN';
const zhHkKey = 'zh-HK';

const enTranslation = {
  input: {
    username: 'Username 1',
    password: 'Password 2',
    email: 'Email 3',
    phone_number: 'Phone number 4',
    confirm_password: 'Confirm password 5',
  },
};

const trTrTranslation = {
  input: {
    username: 'Kullanıcı Adı 1',
    password: 'Şifre 2',
    email: 'E-posta Adresi 3',
    phone_number: 'Telefon Numarası 4',
    confirm_password: 'Şifreyi Doğrula 5',
  },
};

const zhHkTranslation = {
  input: {
    email: '郵箱 1',
    password: '密碼 2',
    username: '用戶名 3',
    phone_number: '手機號 4',
    confirm_password: '確認密碼 5',
  },
};

const mockCustomPhrases: Record<string, CustomPhrase> = {
  [enKey]: {
    languageKey: enKey,
    translation: enTranslation,
  },
  [koKrKey]: {
    languageKey: koKrKey,
    translation: koKR.translation,
  },
  [trTrKey]: {
    languageKey: trTrKey,
    translation: trTrTranslation,
  },
  [zhHkKey]: {
    languageKey: zhHkKey,
    translation: zhHkTranslation,
  },
};

const findAllCustomLanguageKeys = jest.fn(async () => Object.keys(mockCustomPhrases));

const findCustomPhraseByLanguageKey = jest.fn(async (languageKey: string) => {
  const mockCustomPhrase = mockCustomPhrases[languageKey];

  if (!mockCustomPhrase) {
    throw new RequestError({ code: 'entity.not_found', status: 404 });
  }

  return mockCustomPhrase;
});

jest.mock('@/queries/custom-phrase', () => ({
  findAllCustomLanguageKeys: async () => findAllCustomLanguageKeys(),
  findCustomPhraseByLanguageKey: async (key: string) => findCustomPhraseByLanguageKey(key),
}));

const signInExperienceQuerySpy = jest
  .spyOn(signInExperienceQueries, 'findDefaultSignInExperience')
  .mockResolvedValue(mockSignInExperience);

const mockApplicationId = 'mockApplicationIdValue';

const interactionDetails: jest.MockedFunction<() => Promise<unknown>> = jest.fn(async () => ({
  params: { client_id: mockApplicationId },
}));

jest.mock('oidc-provider', () => ({
  Provider: jest.fn(() => ({
    interactionDetails,
  })),
}));

describe('GET /phrase', () => {
  const phraseRequest = createRequester({
    anonymousRoutes: phraseRoutes,
    provider: new Provider(''),
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when auto-detect is enabled', () => {
    it('should return first supported detected language', async () => {
      const response = await phraseRequest
        .get('/phrase')
        .set('Accept-Language', `xx-XX,${zhHkKey},${trTrKey}`);
      expect(response.status).toEqual(200);
      expect(response.body).toHaveProperty('languageKey', zhHkKey);
    });

    it('should return default language when there are no Accept-Language header', async () => {
      const response = await phraseRequest.get('/phrase');
      expect(response.status).toEqual(200);
      expect(response.body).toHaveProperty(
        'languageKey',
        mockSignInExperience.languageInfo.fallbackLanguage
      );
    });

    it('should return default language when Accept-Language header is "*"', async () => {
      const response = await phraseRequest.get('/phrase').set('Accept-Language', '*');
      expect(response.status).toEqual(200);
      expect(response.body).toHaveProperty(
        'languageKey',
        mockSignInExperience.languageInfo.fallbackLanguage
      );
    });

    it('should return default language when all detected languages (from Accept-Language header) are not supported', async () => {
      const response = await phraseRequest.get('/phrase').set('Accept-Language', 'xx-XX,yy-YY');
      expect(response.status).toEqual(200);
      expect(response.body).toHaveProperty(
        'languageKey',
        mockSignInExperience.languageInfo.fallbackLanguage
      );
    });

    it('should return `en` language when both default and detected languages are not supported', async () => {
      signInExperienceQuerySpy.mockResolvedValueOnce({
        ...mockSignInExperience,
        languageInfo: {
          autoDetect: false,
          // @ts-expect-error not supported language
          fallbackLanguage: 'zz-ZZ',
          fixedLanguage: ptPtKey,
        },
      });
      const response = await phraseRequest.get('/phrase').set('Accept-Language', 'xx-XX,yy-YY');
      expect(response.status).toEqual(200);
      expect(response.body).toHaveProperty('languageKey', enKey);
    });
  });

  describe('when auto-detect is not enabled', () => {
    it('should return default language', async () => {
      signInExperienceQuerySpy.mockResolvedValueOnce({
        ...mockSignInExperience,
        languageInfo: {
          autoDetect: false,
          fallbackLanguage: ptPtKey,
          fixedLanguage: ptPtKey,
        },
      });
      const response = await phraseRequest
        .get('/phrase')
        .set('Accept-Language', `${zhCnKey},${trTrKey}`);
      expect(response.status).toEqual(200);
      expect(response.body).toHaveProperty('languageKey', ptPtKey);
    });

    it('should return `en` language when default language is not supported', async () => {
      signInExperienceQuerySpy.mockResolvedValueOnce({
        ...mockSignInExperience,
        languageInfo: {
          autoDetect: false,
          // @ts-expect-error not supported language
          fallbackLanguage: 'zz-ZZ',
          fixedLanguage: zhCnKey,
        },
      });
      const response = await phraseRequest
        .get('/phrase')
        .set('Accept-Language', `${zhCnKey},${trTrKey}`);
      expect(response.status).toEqual(200);
      expect(response.body).toHaveProperty('languageKey', enKey);
    });
  });

  describe('return fully translated phrase', () => {
    describe('when specified language custom phrase does not exist', () => {
      it('should be specified language built-in phrase when it exists', async () => {
        const response = await phraseRequest.get('/phrase').set('Accept-Language', zhCnKey);
        expect(response.status).toEqual(200);
        expect(response.body).toEqual({ ...zhCN, languageKey: zhCnKey });
      });
    });

    describe('when specified language custom phrase is fully translated', () => {
      it('should be specified language custom phrase', async () => {
        const response = await phraseRequest.get('/phrase').set('Accept-Language', koKrKey);
        expect(response.status).toEqual(200);
        expect(response.body).toEqual({ translation: koKR.translation, languageKey: koKrKey });
      });
    });

    describe('when specified language custom phrase is not fully translated', () => {
      describe('when specified language built-in phrase exists', () => {
        it('should merge specified language custom phrase with its built-in phrase', async () => {
          const response = await phraseRequest.get('/phrase').set('Accept-Language', trTrKey);
          expect(response.status).toEqual(200);
          expect(response.body).toEqual(
            deepmerge(trTR, { translation: trTrTranslation, languageKey: trTrKey })
          );
        });
      });

      describe('when specified language built-in phrase does not exist', () => {
        describe('when default language custom phrase does not exists', () => {
          it('should merge specified language custom phrase with default language built-in phrase', async () => {
            signInExperienceQuerySpy.mockResolvedValueOnce({
              ...mockSignInExperience,
              languageInfo: {
                autoDetect: true,
                fallbackLanguage: zhCnKey,
                fixedLanguage: zhCnKey,
              },
            });
            const response = await phraseRequest.get('/phrase').set('Accept-Language', zhHkKey);
            expect(response.status).toEqual(200);
            expect(response.body).toEqual(
              deepmerge(zhCN, { translation: zhHkTranslation, languageKey: zhHkKey })
            );
          });
        });

        describe('when default language custom phrase exists', () => {
          describe('when default language custom phrase is fully translated', () => {
            it('should merge specified language custom phrase with default language custom phrase', async () => {
              signInExperienceQuerySpy.mockResolvedValueOnce({
                ...mockSignInExperience,
                languageInfo: {
                  autoDetect: true,
                  fallbackLanguage: koKrKey,
                  fixedLanguage: enKey,
                },
              });
              const response = await phraseRequest.get('/phrase').set('Accept-Language', zhHkKey);
              expect(response.status).toEqual(200);
              expect(response.body).toEqual({
                translation: deepmerge(koKR.translation, zhHkTranslation),
                languageKey: zhHkKey,
              });
            });
          });

          describe('when default language custom phrase is not fully translated', () => {
            it('should merge specified language custom phrase with default language custom and built-in phrase', async () => {
              signInExperienceQuerySpy.mockResolvedValueOnce({
                ...mockSignInExperience,
                languageInfo: {
                  autoDetect: true,
                  fallbackLanguage: enKey,
                  fixedLanguage: enKey,
                },
              });
              const response = await phraseRequest.get('/phrase').set('Accept-Language', zhHkKey);
              expect(response.status).toEqual(200);
              expect(response.body).toEqual({
                translation: deepmerge({ ...en.translation, ...enTranslation }, zhHkTranslation),
                languageKey: zhHkKey,
              });
            });
          });
        });
      });
    });
  });
});
