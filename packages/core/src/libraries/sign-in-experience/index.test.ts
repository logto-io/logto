import type { LanguageTag } from '@logto/language-kit';
import { builtInLanguages } from '@logto/phrases-experience';
import { CaptchaType, type CreateSignInExperience, type SignInExperience } from '@logto/schemas';
import { TtlCache } from '@logto/shared';

import {
  mockAliyunDmConnector,
  mockAliyunSmsConnector,
  mockCaptchaProvider,
  mockCustomProfileFields,
  mockGithubConnector,
  mockGoogleConnector,
  mockSignInExperience,
  mockSocialConnectors,
  socialTarget01,
  socialTarget02,
  wellConfiguredSsoConnector,
} from '#src/__mocks__/index.js';
import { WellKnownCache } from '#src/caches/well-known.js';
import RequestError from '#src/errors/RequestError/index.js';
import { ssoConnectorFactories } from '#src/sso/index.js';
import {
  mockLogtoConfigsLibrary,
  mockSsoConnectorLibrary,
} from '#src/test-utils/mock-libraries.js';

import { createCloudConnectionLibrary } from '../cloud-connection.js';
import { createConnectorLibrary } from '../connector.js';

const { jest } = import.meta;

const allCustomLanguageTags: LanguageTag[] = [];

const customPhrases = {
  findAllCustomLanguageTags: jest.fn(async () => allCustomLanguageTags),
};
const { findAllCustomLanguageTags } = customPhrases;

const signInExperiences = {
  findDefaultSignInExperience: jest.fn(),
  updateDefaultSignInExperience: jest.fn(
    async (data: Partial<CreateSignInExperience>): Promise<SignInExperience> => ({
      ...mockSignInExperience,
      ...data,
    })
  ),
};
const { findDefaultSignInExperience, updateDefaultSignInExperience } = signInExperiences;

const captchaProviders = {
  findCaptchaProvider: jest.fn(),
};
const { findCaptchaProvider } = captchaProviders;

const customProfileFields = {
  findAllCustomProfileFields: jest.fn(),
};
const { findAllCustomProfileFields } = customProfileFields;

const { MockQueries } = await import('#src/test-utils/tenant.js');

const queries = new MockQueries({
  customPhrases,
  signInExperiences,
  captchaProviders,
  customProfileFields,
});
const connectorLibrary = createConnectorLibrary(queries, {
  getClient: jest.fn(),
});
const cloudConnection = createCloudConnectionLibrary({
  ...mockLogtoConfigsLibrary,
  getCloudConnectionData: jest.fn().mockResolvedValue({
    appId: 'appId',
    appSecret: 'appSecret',
    resource: 'resource',
  }),
});

const getLogtoConnectors = jest.spyOn(connectorLibrary, 'getLogtoConnectors');

const { createSignInExperienceLibrary } = await import('./index.js');
const {
  validateLanguageInfo,
  removeUnavailableSocialConnectorTargets,
  getFullSignInExperience,
  findCaptchaPublicConfig,
} = createSignInExperienceLibrary(
  queries,
  connectorLibrary,
  mockSsoConnectorLibrary,
  cloudConnection,
  new WellKnownCache('foo', new TtlCache())
);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('validate language info', () => {
  it('should call findAllCustomLanguageTags', async () => {
    await validateLanguageInfo({
      autoDetect: true,
      fallbackLanguage: 'zh-CN',
    });
    expect(findAllCustomLanguageTags).toBeCalledTimes(1);
  });

  it('should pass when the language is built-in supported', async () => {
    const builtInSupportedLanguage = 'tr-TR';
    await expect(
      validateLanguageInfo({
        autoDetect: true,
        fallbackLanguage: builtInSupportedLanguage,
      })
    ).resolves.not.toThrow();
    expect(findAllCustomLanguageTags).toBeCalledTimes(1);
  });

  it('should pass when the language is custom supported', async () => {
    const customOnlySupportedLanguage = 'zh-HK';
    expect(customOnlySupportedLanguage in builtInLanguages).toBeFalsy();
    findAllCustomLanguageTags.mockResolvedValueOnce([customOnlySupportedLanguage]);
    await expect(
      validateLanguageInfo({
        autoDetect: true,
        fallbackLanguage: customOnlySupportedLanguage,
      })
    ).resolves.not.toThrow();
    expect(findAllCustomLanguageTags).toBeCalledTimes(1);
  });

  it('unsupported fallback language should fail', async () => {
    const unsupportedLanguage = 'zh-MO';
    expect(unsupportedLanguage in builtInLanguages).toBeFalsy();
    expect(allCustomLanguageTags.includes(unsupportedLanguage)).toBeFalsy();
    await expect(
      validateLanguageInfo({
        autoDetect: true,
        fallbackLanguage: unsupportedLanguage,
      })
    ).rejects.toMatchError(
      new RequestError({
        code: 'sign_in_experiences.unsupported_default_language',
        language: unsupportedLanguage,
      })
    );
  });
});

describe('remove unavailable social connector targets', () => {
  it('should remove unavailable social connector targets in sign-in experience', async () => {
    const mockSocialConnectorTargets = mockSocialConnectors.map(
      ({ metadata: { target } }) => target
    );
    findDefaultSignInExperience.mockResolvedValueOnce({
      ...mockSignInExperience,
      socialSignInConnectorTargets: mockSocialConnectorTargets,
    });
    getLogtoConnectors.mockResolvedValueOnce(mockSocialConnectors);
    expect(mockSocialConnectorTargets).toEqual([socialTarget01, socialTarget02]);
    await removeUnavailableSocialConnectorTargets();
    expect(updateDefaultSignInExperience).toBeCalledWith({
      socialSignInConnectorTargets: [socialTarget01, socialTarget02],
    });
  });
});

describe('getFullSignInExperience()', () => {
  it('should return full sign-in experience', async () => {
    findDefaultSignInExperience.mockResolvedValueOnce(mockSignInExperience);
    getLogtoConnectors.mockResolvedValueOnce(mockSocialConnectors);
    mockSsoConnectorLibrary.getAvailableSsoConnectors.mockResolvedValueOnce([
      wellConfiguredSsoConnector,
    ]);
    findAllCustomProfileFields.mockResolvedValueOnce(mockCustomProfileFields);

    const fullSignInExperience = await getFullSignInExperience({ locale: 'en' });
    const connectorFactory = ssoConnectorFactories[wellConfiguredSsoConnector.providerName];

    expect(fullSignInExperience).toStrictEqual({
      ...mockSignInExperience,
      socialConnectors: [],
      socialSignInConnectorTargets: ['github', 'facebook', 'wechat'],
      ssoConnectors: [
        {
          id: wellConfiguredSsoConnector.id,
          connectorName: connectorFactory.name.en,
          logo: connectorFactory.logo,
          darkLogo: connectorFactory.logoDark,
        },
      ],
      isDevelopmentTenant: false,
      googleOneTap: undefined,
      captchaConfig: undefined,
      customProfileFields: mockCustomProfileFields,
      forgotPassword: {
        email: false,
        phone: false,
      },
    });
  });

  it('should return full sign-in experience with google one tap', async () => {
    findDefaultSignInExperience.mockResolvedValueOnce({
      ...mockSignInExperience,
      socialSignInConnectorTargets: ['github', 'facebook', 'google'],
    });
    getLogtoConnectors.mockResolvedValueOnce([mockGoogleConnector, mockGithubConnector]);
    findAllCustomProfileFields.mockResolvedValueOnce(mockCustomProfileFields);
    mockSsoConnectorLibrary.getAvailableSsoConnectors.mockResolvedValueOnce([
      wellConfiguredSsoConnector,
    ]);

    const fullSignInExperience = await getFullSignInExperience({ locale: 'en' });
    const connectorFactory = ssoConnectorFactories[wellConfiguredSsoConnector.providerName];

    expect(fullSignInExperience).toStrictEqual({
      ...mockSignInExperience,
      socialConnectors: [
        { ...mockGithubConnector.metadata, id: mockGithubConnector.dbEntry.id },
        { ...mockGoogleConnector.metadata, id: mockGoogleConnector.dbEntry.id },
      ],
      socialSignInConnectorTargets: ['github', 'facebook', 'google'],
      ssoConnectors: [
        {
          id: wellConfiguredSsoConnector.id,
          connectorName: connectorFactory.name.en,
          logo: connectorFactory.logo,
          darkLogo: connectorFactory.logoDark,
        },
      ],
      isDevelopmentTenant: false,
      googleOneTap: {
        isEnabled: true,
        autoSelect: true,
        clientId: 'fake_client_id',
        connectorId: 'google',
      },
      captchaConfig: undefined,
      customProfileFields: mockCustomProfileFields,
      forgotPassword: {
        email: false,
        phone: false,
      },
    });
  });
});

describe('get sso connectors', () => {
  it('should return empty array if dev feature is disabled', async () => {
    getLogtoConnectors.mockResolvedValueOnce(mockSocialConnectors);
    findDefaultSignInExperience.mockResolvedValueOnce({
      ...mockSignInExperience,
      singleSignOnEnabled: false,
    });

    const { ssoConnectors } = await getFullSignInExperience({ locale: 'en' });

    expect(mockSsoConnectorLibrary.getAvailableSsoConnectors).not.toBeCalled();

    expect(ssoConnectors).toEqual([]);
  });

  it('should return sso connectors metadata', async () => {
    getLogtoConnectors.mockResolvedValueOnce(mockSocialConnectors);
    findDefaultSignInExperience.mockResolvedValueOnce(mockSignInExperience);

    mockSsoConnectorLibrary.getAvailableSsoConnectors.mockResolvedValueOnce([
      wellConfiguredSsoConnector,
    ]);

    const { ssoConnectors } = await getFullSignInExperience({ locale: 'jp' });

    const connectorFactory = ssoConnectorFactories[wellConfiguredSsoConnector.providerName];

    expect(ssoConnectors).toEqual([
      {
        id: wellConfiguredSsoConnector.id,
        connectorName: connectorFactory.name.en,
        logo: connectorFactory.logo,
        darkLogo: connectorFactory.logoDark,
      },
    ]);
  });

  it('should return displayName if provided', async () => {
    getLogtoConnectors.mockResolvedValueOnce(mockSocialConnectors);
    findDefaultSignInExperience.mockResolvedValueOnce(mockSignInExperience);

    const displayName = 'Logto Connector';

    mockSsoConnectorLibrary.getAvailableSsoConnectors.mockResolvedValueOnce([
      {
        ...wellConfiguredSsoConnector,
        branding: {
          displayName,
        },
      },
    ]);

    const connectorFactory = ssoConnectorFactories[wellConfiguredSsoConnector.providerName];

    const { ssoConnectors } = await getFullSignInExperience({ locale: 'en' });

    expect(ssoConnectors).toEqual([
      {
        id: wellConfiguredSsoConnector.id,
        connectorName: displayName,
        logo: connectorFactory.logo,
        darkLogo: connectorFactory.logoDark,
      },
    ]);
  });
});

describe('findCaptchaPublicConfig', () => {
  it('should return captcha public config', async () => {
    findCaptchaProvider.mockResolvedValueOnce(mockCaptchaProvider);

    const captchaPublicConfig = await findCaptchaPublicConfig();

    expect(captchaPublicConfig).toEqual({
      type: CaptchaType.Turnstile,
      siteKey: 'captcha_site_key',
    });
  });

  it('should return undefined if captcha provider is not found', async () => {
    // eslint-disable-next-line unicorn/no-useless-undefined
    findCaptchaProvider.mockResolvedValueOnce(undefined);

    const captchaPublicConfig = await findCaptchaPublicConfig();

    expect(captchaPublicConfig).toBeUndefined();
  });
});

describe('forgot password methods', () => {
  it('should return connector-based methods when forgotPasswordMethods is null', async () => {
    findDefaultSignInExperience.mockResolvedValueOnce({
      ...mockSignInExperience,
      forgotPasswordMethods: null, // Test null case
    });
    getLogtoConnectors.mockResolvedValueOnce([mockAliyunDmConnector, mockAliyunSmsConnector]);
    mockSsoConnectorLibrary.getAvailableSsoConnectors.mockResolvedValueOnce([]);

    const fullSignInExperience = await getFullSignInExperience({ locale: 'en' });

    expect(fullSignInExperience.forgotPassword).toEqual({
      email: true,
      phone: true,
    });
  });

  it('should return false values when forgotPasswordMethods is null and no connectors available', async () => {
    findDefaultSignInExperience.mockResolvedValueOnce({
      ...mockSignInExperience,
      forgotPasswordMethods: null,
    });
    getLogtoConnectors.mockResolvedValueOnce([]); // No connectors
    mockSsoConnectorLibrary.getAvailableSsoConnectors.mockResolvedValueOnce([]);

    const fullSignInExperience = await getFullSignInExperience({ locale: 'en' });

    expect(fullSignInExperience.forgotPassword).toEqual({
      email: false,
      phone: false,
    });
  });
});
