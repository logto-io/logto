import zhCN from '@logto/phrases-ui/lib/locales/zh-cn';
import { SignInExperience } from '@logto/schemas';
import { adminConsoleApplicationId, adminConsoleSignInExperience } from '@logto/schemas/lib/seeds';
import { Provider } from 'oidc-provider';

import { mockSignInExperience } from '@/__mocks__';
import { zhCnKey } from '@/__mocks__/custom-phrase';
import * as detectLanguage from '@/i18n/detect-language';
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

const customizedLanguage = zhCnKey;

const findDefaultSignInExperience = jest.fn(
  async (): Promise<SignInExperience> => ({
    ...mockSignInExperience,
    languageInfo: {
      autoDetect: true,
      fallbackLanguage: customizedLanguage,
      fixedLanguage: customizedLanguage,
    },
  })
);

jest.mock('@/queries/sign-in-experience', () => ({
  findDefaultSignInExperience: async () => findDefaultSignInExperience(),
}));

const detectLanguageSpy = jest.spyOn(detectLanguage, 'default');

const findAllCustomLanguageKeys = jest.fn(async () => [customizedLanguage]);
const findCustomPhraseByLanguageKey = jest.fn(async (key: string) => ({}));

jest.mock('@/queries/custom-phrase', () => ({
  findAllCustomLanguageKeys: async () => findAllCustomLanguageKeys(),
  findCustomPhraseByLanguageKey: async (key: string) => findCustomPhraseByLanguageKey(key),
}));

const getPhrase = jest.fn(async (language: string, customLanguages: string[]) => zhCN);

jest.mock('@/lib/phrase', () => ({
  ...jest.requireActual('@/lib/phrase'),
  getPhrase: async (language: string, customLanguages: string[]) =>
    getPhrase(language, customLanguages),
}));

const phraseRequest = createRequester({
  anonymousRoutes: phraseRoutes,
  provider: new Provider(''),
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('when the application is admin-console', () => {
  beforeEach(() => {
    interactionDetails.mockResolvedValueOnce({
      params: { client_id: adminConsoleApplicationId },
    });
  });

  it('should call interactionDetails', async () => {
    await expect(phraseRequest.get('/phrase')).resolves.toHaveProperty('status', 200);
    expect(interactionDetails).toBeCalledTimes(1);
  });

  it('should not call findDefaultSignInExperience', async () => {
    await expect(phraseRequest.get('/phrase')).resolves.toHaveProperty('status', 200);
    expect(findDefaultSignInExperience).not.toBeCalled();
  });

  it('should call detectLanguage', async () => {
    await expect(phraseRequest.get('/phrase')).resolves.toHaveProperty('status', 200);
    expect(detectLanguageSpy).toBeCalledTimes(1);
  });

  it('should call findAllCustomLanguageKeys', async () => {
    await expect(phraseRequest.get('/phrase')).resolves.toHaveProperty('status', 200);
    expect(findAllCustomLanguageKeys).toBeCalledTimes(1);
  });

  it('should call getPhrase with fallback language from Admin Console sign-in experience', async () => {
    await expect(phraseRequest.get('/phrase')).resolves.toHaveProperty('status', 200);
    expect(getPhrase).toBeCalledTimes(1);
    expect(getPhrase).toBeCalledWith(adminConsoleSignInExperience.languageInfo.fallbackLanguage, [
      customizedLanguage,
    ]);
  });
});

describe('when the application is not admin-console', () => {
  it('should call interactionDetails', async () => {
    await expect(phraseRequest.get('/phrase')).resolves.toHaveProperty('status', 200);
    expect(interactionDetails).toBeCalledTimes(1);
  });

  it('should call findDefaultSignInExperience', async () => {
    await expect(phraseRequest.get('/phrase')).resolves.toHaveProperty('status', 200);
    expect(findDefaultSignInExperience).toBeCalledTimes(1);
  });

  it('should call detectLanguage when auto-detect is enabled', async () => {
    findDefaultSignInExperience.mockResolvedValueOnce({
      ...mockSignInExperience,
      languageInfo: {
        ...mockSignInExperience.languageInfo,
        autoDetect: true,
      },
    });
    await expect(phraseRequest.get('/phrase')).resolves.toHaveProperty('status', 200);
    expect(detectLanguageSpy).toBeCalledTimes(1);
  });

  it('should not call detectLanguage when auto-detect is not enabled', async () => {
    findDefaultSignInExperience.mockResolvedValueOnce({
      ...mockSignInExperience,
      languageInfo: {
        ...mockSignInExperience.languageInfo,
        autoDetect: false,
      },
    });
    await expect(phraseRequest.get('/phrase')).resolves.toHaveProperty('status', 200);
    expect(detectLanguageSpy).not.toBeCalled();
  });

  it('should call findAllCustomLanguageKeys', async () => {
    await expect(phraseRequest.get('/phrase')).resolves.toHaveProperty('status', 200);
    expect(findAllCustomLanguageKeys).toBeCalledTimes(1);
  });

  it('should call getPhrase with fallback language from default sign-in experience', async () => {
    findDefaultSignInExperience.mockResolvedValueOnce({
      ...mockSignInExperience,
      languageInfo: {
        autoDetect: false,
        fallbackLanguage: customizedLanguage,
        fixedLanguage: customizedLanguage,
      },
    });
    await expect(phraseRequest.get('/phrase')).resolves.toHaveProperty('status', 200);
    expect(getPhrase).toBeCalledTimes(1);
    expect(getPhrase).toBeCalledWith(customizedLanguage, [customizedLanguage]);
  });
});
