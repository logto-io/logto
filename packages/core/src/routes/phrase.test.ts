import zhCN from '@logto/phrases-ui/lib/locales/zh-cn.js';
import type { SignInExperience } from '@logto/schemas';
import {
  adminConsoleApplicationId,
  adminConsoleSignInExperience,
} from '@logto/schemas/lib/seeds/index.js';
import { Provider } from 'oidc-provider';

import { zhCnTag } from '#src/__mocks__/custom-phrase.js';
import { mockSignInExperience } from '#src/__mocks__/index.js';
import * as detectLanguage from '#src/i18n/detect-language.js';
import phraseRoutes from '#src/routes/phrase.js';
import { createRequester } from '#src/utils/test-utils.js';

const mockApplicationId = 'mockApplicationIdValue';

const interactionDetails: jest.MockedFunction<() => Promise<unknown>> = jest.fn(async () => ({
  params: { client_id: mockApplicationId },
}));

jest.mock('oidc-provider', () => ({
  Provider: jest.fn(() => ({
    interactionDetails,
  })),
}));

const customizedLanguage = zhCnTag;

const findDefaultSignInExperience = jest.fn(
  async (): Promise<SignInExperience> => ({
    ...mockSignInExperience,
    languageInfo: {
      autoDetect: true,
      fallbackLanguage: customizedLanguage,
    },
  })
);

jest.mock('#src/queries/sign-in-experience.js', () => ({
  findDefaultSignInExperience: async () => findDefaultSignInExperience(),
}));

const detectLanguageSpy = jest.spyOn(detectLanguage, 'default');

const findAllCustomLanguageTags = jest.fn(async () => [customizedLanguage]);
const findCustomPhraseByLanguageTag = jest.fn(async (tag: string) => ({}));

jest.mock('#src/queries/custom-phrase.js', () => ({
  findAllCustomLanguageTags: async () => findAllCustomLanguageTags(),
  findCustomPhraseByLanguageTag: async (tag: string) => findCustomPhraseByLanguageTag(tag),
}));

const getPhrase = jest.fn(async (language: string, customLanguages: string[]) => zhCN);

jest.mock('#src/lib/phrase.js', () => ({
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

  it('should call findAllCustomLanguageTags', async () => {
    await expect(phraseRequest.get('/phrase')).resolves.toHaveProperty('status', 200);
    expect(findAllCustomLanguageTags).toBeCalledTimes(1);
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

  it('should call findAllCustomLanguageTags', async () => {
    await expect(phraseRequest.get('/phrase')).resolves.toHaveProperty('status', 200);
    expect(findAllCustomLanguageTags).toBeCalledTimes(1);
  });

  it('should call getPhrase with fallback language from default sign-in experience', async () => {
    findDefaultSignInExperience.mockResolvedValueOnce({
      ...mockSignInExperience,
      languageInfo: {
        autoDetect: false,
        fallbackLanguage: customizedLanguage,
      },
    });
    await expect(phraseRequest.get('/phrase')).resolves.toHaveProperty('status', 200);
    expect(getPhrase).toBeCalledTimes(1);
    expect(getPhrase).toBeCalledWith(customizedLanguage, [customizedLanguage]);
  });
});
