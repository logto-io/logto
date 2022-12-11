import zhCN from '@logto/phrases-ui/lib/locales/zh-cn.js';
import type { SignInExperience } from '@logto/schemas';
import {
  adminConsoleApplicationId,
  adminConsoleSignInExperience,
} from '@logto/schemas/lib/seeds/index.js';
import { mockEsm, mockEsmWithActual, pickDefault } from '@logto/shared/esm';

import { zhCnTag } from '#src/__mocks__/custom-phrase.js';
import { mockSignInExperience } from '#src/__mocks__/index.js';
import { createMockProvider } from '#src/test-utils/oidc-provider.js';

const { jest } = import.meta;

const customizedLanguage = zhCnTag;

const { findDefaultSignInExperience } = mockEsm('#src/queries/sign-in-experience.js', () => ({
  findDefaultSignInExperience: jest.fn(
    async (): Promise<SignInExperience> => ({
      ...mockSignInExperience,
      languageInfo: {
        autoDetect: true,
        fallbackLanguage: customizedLanguage,
      },
    })
  ),
}));

const { default: detectLanguageSpy } = mockEsm('#src/i18n/detect-language.js', () => ({
  default: jest.fn().mockReturnValue([]),
}));

const { findAllCustomLanguageTags } = mockEsm('#src/queries/custom-phrase.js', () => ({
  findAllCustomLanguageTags: jest.fn(async () => [customizedLanguage]),
  findCustomPhraseByLanguageTag: jest.fn(async (tag: string) => ({})),
}));

const { getPhrase } = await mockEsmWithActual('#src/lib/phrase.js', () => ({
  getPhrase: jest.fn(async () => zhCN),
}));

const interactionDetails = jest.fn();
const { createRequester } = await import('#src/utils/test-utils.js');
const phraseRoutes = await pickDefault(import('./phrase.js'));

const phraseRequest = createRequester({
  anonymousRoutes: phraseRoutes,
  provider: createMockProvider(interactionDetails),
});

describe('when the application is admin-console', () => {
  beforeEach(() => {
    interactionDetails.mockResolvedValueOnce({
      params: { client_id: adminConsoleApplicationId },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
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
  beforeEach(() => {
    interactionDetails.mockResolvedValue({
      params: {},
      jti: 'jti',
      client_id: 'mockApplicationId',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

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
