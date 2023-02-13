import zhCN from '@logto/phrases-ui/lib/locales/zh-cn.js';
import type { CustomPhrase, SignInExperience } from '@logto/schemas';
import { adminConsoleApplicationId, adminConsoleSignInExperience } from '@logto/schemas';
import { pickDefault, createMockUtils } from '@logto/shared/esm';

import { zhCnTag } from '#src/__mocks__/custom-phrase.js';
import { mockSignInExperience } from '#src/__mocks__/index.js';
import Queries from '#src/tenants/Queries.js';
import { createMockProvider } from '#src/test-utils/oidc-provider.test.js';
import { MockTenant } from '#src/test-utils/tenant.test.js';

const { jest } = import.meta;

const { mockEsm } = createMockUtils(jest);

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

const { default: detectLanguageSpy } = mockEsm('#src/i18n/detect-language.js', () => ({
  default: jest.fn().mockReturnValue([]),
}));

const customPhrases = {
  findAllCustomLanguageTags: jest.fn(async () => [customizedLanguage]),
  findCustomPhraseByLanguageTag: jest.fn(
    async (tag: string): Promise<CustomPhrase> => ({
      tenantId: 'fake_tenant',
      id: 'fake_id',
      languageTag: tag,
      translation: {},
    })
  ),
} satisfies Partial<Queries['customPhrases']>;
const { findAllCustomLanguageTags } = customPhrases;

const getPhrases = jest.fn(async () => zhCN);

const interactionDetails = jest.fn();
const tenantContext = new MockTenant(
  createMockProvider(interactionDetails),
  { customPhrases, signInExperiences: { findDefaultSignInExperience } },
  { phrases: { getPhrases } }
);

const phraseRoutes = await pickDefault(import('./phrase.js'));

const { createRequester } = await import('#src/utils/test-utils.test.js');
const phraseRequest = createRequester({
  anonymousRoutes: phraseRoutes,
  tenantContext,
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

  it('should call getPhrases with fallback language from Admin Console sign-in experience', async () => {
    await expect(phraseRequest.get('/phrase')).resolves.toHaveProperty('status', 200);
    expect(getPhrases).toBeCalledTimes(1);
    expect(getPhrases).toBeCalledWith(adminConsoleSignInExperience.languageInfo.fallbackLanguage, [
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

  it('should call getPhrases with fallback language from default sign-in experience', async () => {
    findDefaultSignInExperience.mockResolvedValueOnce({
      ...mockSignInExperience,
      languageInfo: {
        autoDetect: false,
        fallbackLanguage: customizedLanguage,
      },
    });
    await expect(phraseRequest.get('/phrase')).resolves.toHaveProperty('status', 200);
    expect(getPhrases).toBeCalledTimes(1);
    expect(getPhrases).toBeCalledWith(customizedLanguage, [customizedLanguage]);
  });
});
