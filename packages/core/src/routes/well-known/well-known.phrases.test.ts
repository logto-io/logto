import zhCN from '@logto/phrases-experience/lib/locales/zh-cn/index.js';
import { type CustomPhrase, type SignInExperience } from '@logto/schemas';
import { pickDefault, createMockUtils } from '@logto/shared/esm';

import { zhCnTag } from '#src/__mocks__/custom-phrase.js';
import { mockSignInExperience } from '#src/__mocks__/index.js';
import type Queries from '#src/tenants/Queries.js';
import { createMockProvider } from '#src/test-utils/oidc-provider.js';
import { MockTenant, MockWellKnownCache } from '#src/test-utils/tenant.js';

const { jest } = import.meta;

const { mockEsm } = createMockUtils(jest);

const { default: detectLanguageSpy } = mockEsm('#src/i18n/detect-language.js', () => ({
  default: jest.fn().mockReturnValue([]),
}));

const customizedLanguage = zhCnTag;
const mockCache = new MockWellKnownCache();

const rawFindDefaultSignInExperience = jest.fn(
  async (): Promise<SignInExperience> => ({
    ...mockSignInExperience,
    languageInfo: {
      autoDetect: true,
      fallbackLanguage: customizedLanguage,
    },
  })
);
const findDefaultSignInExperience = jest.fn(
  mockCache.memoize(rawFindDefaultSignInExperience, ['sie'])
);

const rawFindAllCustomLanguageTags = jest.fn(async () => [customizedLanguage]);
const findAllCustomLanguageTags = jest.fn(
  mockCache.memoize(rawFindAllCustomLanguageTags, ['custom-phrases-tags'])
);

const customPhrases = {
  findAllCustomLanguageTags,
  findCustomPhraseByLanguageTag: jest.fn(
    async (tag: string): Promise<CustomPhrase> => ({
      tenantId: 'fake_tenant',
      id: 'fake_id',
      languageTag: tag,
      translation: {},
    })
  ),
} satisfies Partial<Queries['customPhrases']>;

const getPhrases = jest.fn(async () => zhCN);

const tenantContext = new MockTenant(
  createMockProvider(),
  { customPhrases, signInExperiences: { findDefaultSignInExperience } },
  undefined,
  { phrases: { getPhrases } }
);

const phraseRoutes = await pickDefault(import('./index.js'));

const { createRequester } = await import('#src/utils/test-utils.js');
const phraseRequest = createRequester({
  anonymousRoutes: phraseRoutes,
  tenantContext,
});

afterEach(() => {
  mockCache.ttlCache.clear();
  jest.clearAllMocks();
});

describe('when the application is not admin-console', () => {
  it('should call findDefaultSignInExperience', async () => {
    await expect(phraseRequest.get('/.well-known/phrases')).resolves.toHaveProperty('status', 200);
    expect(findDefaultSignInExperience).toBeCalledTimes(1);
  });

  it('should call detectLanguage when auto-detect is enabled', async () => {
    rawFindDefaultSignInExperience.mockResolvedValueOnce({
      ...mockSignInExperience,
      languageInfo: {
        ...mockSignInExperience.languageInfo,
        autoDetect: true,
      },
    });
    await expect(phraseRequest.get('/.well-known/phrases')).resolves.toHaveProperty('status', 200);
    expect(detectLanguageSpy).toBeCalledTimes(1);
  });

  it('should not call detectLanguage when auto-detect is not enabled', async () => {
    rawFindDefaultSignInExperience.mockResolvedValueOnce({
      ...mockSignInExperience,
      languageInfo: {
        ...mockSignInExperience.languageInfo,
        autoDetect: false,
      },
    });
    await expect(phraseRequest.get('/.well-known/phrases')).resolves.toHaveProperty('status', 200);
    expect(detectLanguageSpy).not.toBeCalled();
  });

  it('should call findAllCustomLanguageTags', async () => {
    await expect(phraseRequest.get('/.well-known/phrases')).resolves.toHaveProperty('status', 200);
    expect(findAllCustomLanguageTags).toBeCalledTimes(1);
  });

  it('should call getPhrases with fallback language from default sign-in experience', async () => {
    rawFindDefaultSignInExperience.mockResolvedValueOnce({
      ...mockSignInExperience,
      languageInfo: {
        autoDetect: false,
        fallbackLanguage: customizedLanguage,
      },
    });
    await expect(phraseRequest.get('/.well-known/phrases')).resolves.toHaveProperty('status', 200);
    expect(getPhrases).toBeCalledTimes(1);
    expect(getPhrases).toBeCalledWith(customizedLanguage);
  });

  it('should call getPhrases with specific language is provided in params', async () => {
    rawFindDefaultSignInExperience.mockResolvedValueOnce({
      ...mockSignInExperience,
      languageInfo: {
        autoDetect: true,
        fallbackLanguage: customizedLanguage,
      },
    });
    await expect(phraseRequest.get('/.well-known/phrases?lng=fr')).resolves.toHaveProperty(
      'status',
      200
    );
    expect(getPhrases).toBeCalledWith('fr');
  });

  it('should use cache for continuous requests', async () => {
    const [response1, response2, response3] = await Promise.all([
      phraseRequest.get('/.well-known/phrases'),
      phraseRequest.get('/.well-known/phrases'),
      phraseRequest.get('/.well-known/phrases'),
    ]);
    expect(rawFindDefaultSignInExperience).toHaveBeenCalledTimes(1);
    expect(rawFindAllCustomLanguageTags).toHaveBeenCalledTimes(1);
    expect(response1.body).toStrictEqual(response2.body);
    expect(response1.body).toStrictEqual(response3.body);
  });
});
