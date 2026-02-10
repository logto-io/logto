import {
  MfaFactor,
  MfaPolicy,
  type SignInExperience,
  type CreateSignInExperience,
} from '@logto/schemas';
import { pickDefault, createMockUtils } from '@logto/shared/esm';

import {
  mockFacebookConnector,
  mockGithubConnector,
  mockGoogleConnector,
  mockBranding,
  mockSignInExperience,
  mockWechatConnector,
  mockColor,
  mockSignUp,
  mockSignIn,
  mockLanguageInfo,
  mockAliyunSmsConnector,
  mockTermsOfUseUrl,
  mockPrivacyPolicyUrl,
  mockDemoSocialConnector,
} from '#src/__mocks__/index.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

const logtoConnectors = [
  mockFacebookConnector,
  mockGithubConnector,
  mockGoogleConnector,
  mockWechatConnector,
  mockAliyunSmsConnector,
];

const { validateSignIn, validateSignUp } = await mockEsmWithActual(
  '#src/libraries/sign-in-experience/index.js',
  () => ({
    validateSignIn: jest.fn(),
    validateSignUp: jest.fn(),
  })
);

const signInExperiences = {
  findDefaultSignInExperience: jest.fn(async () => mockSignInExperience),
  updateDefaultSignInExperience: async (
    data: Partial<CreateSignInExperience>
  ): Promise<SignInExperience> => ({
    ...mockSignInExperience,
    ...data,
  }),
};
const { findDefaultSignInExperience } = signInExperiences;

const validateLanguageInfo = jest.fn();
const mockGetLogtoConnectors = jest.fn(async () => logtoConnectors);
const mockDeleteConnectorById = jest.fn();

const tenantContext = new MockTenant(
  undefined,
  {
    signInExperiences,
    customPhrases: { findAllCustomLanguageTags: async () => [] },
    connectors: { deleteConnectorById: mockDeleteConnectorById },
  },
  { getLogtoConnectors: mockGetLogtoConnectors },
  { signInExperiences: { validateLanguageInfo } }
);

const signInExperiencesRoutes = await pickDefault(import('./index.js'));
const signInExperienceRequester = createRequester({
  authedRoutes: signInExperiencesRoutes,
  tenantContext,
});

const createDevFeaturesDisabledRequester = async () => {
  jest.resetModules();

  await mockEsmWithActual('#src/env-set/index.js', () => ({
    EnvSet: {
      values: {
        isDevFeaturesEnabled: false,
        isCloud: false,
        isProduction: false,
        isUnitTest: true,
      },
    },
  }));

  const updateDefaultSignInExperience = jest.fn(
    async (data: Partial<CreateSignInExperience>): Promise<SignInExperience> => ({
      ...mockSignInExperience,
      ...data,
    })
  );

  const tenant = new MockTenant(
    undefined,
    {
      signInExperiences: {
        updateDefaultSignInExperience,
        findDefaultSignInExperience: jest.fn().mockResolvedValue(mockSignInExperience),
      },
      customPhrases: { findAllCustomLanguageTags: async () => [] },
    },
    { getLogtoConnectors: jest.fn().mockResolvedValue([]) },
    { signInExperiences: { validateLanguageInfo: jest.fn() } }
  );

  const routes = await pickDefault(import('./index.js'));
  const requester = createRequester({
    authedRoutes: routes,
    tenantContext: tenant,
  });

  return { requester, updateDefaultSignInExperience };
};

describe('GET /sign-in-exp', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should call findDefaultSignInExperience', async () => {
    const response = await signInExperienceRequester.get('/sign-in-exp');
    expect(findDefaultSignInExperience).toHaveBeenCalledTimes(1);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockSignInExperience);
  });
});

describe('PATCH /sign-in-exp', () => {
  afterEach(() => {
    mockDeleteConnectorById.mockClear();
  });

  it('should update social connector targets in correct sorting order', async () => {
    const socialSignInConnectorTargets = ['github', 'facebook'];
    const signInExperience = {
      socialSignInConnectorTargets,
    };
    const response = await signInExperienceRequester.patch('/sign-in-exp').send(signInExperience);
    expect(response).toMatchObject({
      status: 200,
      body: {
        ...mockSignInExperience,
        socialSignInConnectorTargets,
      },
    });
  });

  it('should filter out unavailable social connector targets', async () => {
    const socialSignInConnectorTargets = ['github', 'facebook', 'google'];
    const signInExperience = {
      socialSignInConnectorTargets,
    };
    const response = await signInExperienceRequester.patch('/sign-in-exp').send(signInExperience);
    expect(response).toMatchObject({
      status: 200,
      body: {
        ...mockSignInExperience,
        socialSignInConnectorTargets: ['github', 'facebook', 'google'],
      },
    });
  });

  it('should remove unselected demo social connectors', async () => {
    mockGetLogtoConnectors.mockResolvedValueOnce([...logtoConnectors, mockDemoSocialConnector]);
    const socialSignInConnectorTargets = ['facebook', 'google'];
    const signInExperience = {
      socialSignInConnectorTargets,
    };
    await signInExperienceRequester
      .patch('/sign-in-exp?removeUnusedDemoSocialConnector=1')
      .send(signInExperience);
    expect(mockDeleteConnectorById).toHaveBeenCalledWith(mockDemoSocialConnector.dbEntry.id);
  });

  it('should remove unselected demo social connectors when removeUnusedDemoSocialConnector is not set', async () => {
    mockGetLogtoConnectors.mockResolvedValueOnce([...logtoConnectors, mockDemoSocialConnector]);
    const socialSignInConnectorTargets = ['facebook', 'google'];
    const signInExperience = {
      socialSignInConnectorTargets,
    };
    await signInExperienceRequester.patch('/sign-in-exp').send(signInExperience);
    expect(mockDeleteConnectorById).not.toHaveBeenCalled();
  });

  it('should not remove selected demo social connectors', async () => {
    mockGetLogtoConnectors.mockResolvedValueOnce([...logtoConnectors, mockDemoSocialConnector]);
    const socialSignInConnectorTargets = ['github', 'facebook', 'google'];
    const signInExperience = {
      socialSignInConnectorTargets,
    };
    await signInExperienceRequester
      .patch('/sign-in-exp?removeUnusedDemoSocialConnector=1')
      .send(signInExperience);
    expect(mockDeleteConnectorById).not.toHaveBeenCalled();
  });

  it('should succeed to update when the input is valid', async () => {
    const socialSignInConnectorTargets = ['github', 'facebook', 'wechat'];

    const response = await signInExperienceRequester.patch('/sign-in-exp').send({
      color: mockColor,
      branding: mockBranding,
      languageInfo: mockLanguageInfo,
      termsOfUseUrl: mockTermsOfUseUrl,
      privacyPolicyUrl: mockPrivacyPolicyUrl,
      socialSignInConnectorTargets,
      signUp: mockSignUp,
      signIn: mockSignIn,
    });

    expect(validateLanguageInfo).toHaveBeenCalledWith(mockLanguageInfo);
    expect(validateSignUp).toHaveBeenCalledWith(mockSignUp, logtoConnectors);
    expect(validateSignIn).toHaveBeenCalledWith(
      mockSignIn,
      mockSignUp,
      logtoConnectors,
      mockSignInExperience.mfa
    );

    expect(response).toMatchObject({
      status: 200,
      body: {
        ...mockSignInExperience,
        color: mockColor,
        branding: mockBranding,
        termsOfUseUrl: mockTermsOfUseUrl,
        privacyPolicyUrl: mockPrivacyPolicyUrl,
        socialSignInConnectorTargets,
        signIn: mockSignIn,
      },
    });
  });

  it('should reject adaptive mfa enablement when mfa is disabled', async () => {
    const adaptiveMfa = { enabled: true };

    const response = await signInExperienceRequester.patch('/sign-in-exp').send({ adaptiveMfa });

    expect(response).toMatchObject({
      status: 422,
    });
  });

  it('should update adaptive mfa config when enabling mfa in the same request', async () => {
    const adaptiveMfa = { enabled: true };
    const mfa = {
      policy: MfaPolicy.PromptAtSignInAndSignUp,
      factors: [MfaFactor.TOTP],
    };

    const response = await signInExperienceRequester
      .patch('/sign-in-exp')
      .send({ adaptiveMfa, mfa });

    expect(response).toMatchObject({
      status: 200,
      body: {
        ...mockSignInExperience,
        adaptiveMfa,
        mfa,
      },
    });
  });

  it('should update adaptive mfa config when mfa is already enabled', async () => {
    findDefaultSignInExperience.mockResolvedValueOnce({
      ...mockSignInExperience,
      mfa: {
        policy: MfaPolicy.PromptAtSignInAndSignUp,
        factors: [MfaFactor.TOTP],
      },
    });

    const adaptiveMfa = { enabled: true };

    const response = await signInExperienceRequester.patch('/sign-in-exp').send({ adaptiveMfa });

    expect(response.status).toEqual(200);
  });

  it('should allow disabling mfa when adaptive mfa is already enabled', async () => {
    findDefaultSignInExperience.mockResolvedValueOnce({
      ...mockSignInExperience,
      adaptiveMfa: {
        enabled: true,
      },
      mfa: {
        policy: MfaPolicy.PromptAtSignInAndSignUp,
        factors: [MfaFactor.TOTP],
      },
    });

    const response = await signInExperienceRequester.patch('/sign-in-exp').send({
      mfa: {
        policy: MfaPolicy.PromptAtSignInAndSignUp,
        factors: [],
      },
    });

    expect(response).toMatchObject({
      status: 200,
      body: {
        ...mockSignInExperience,
        adaptiveMfa: {
          enabled: false,
        },
        mfa: {
          policy: MfaPolicy.PromptAtSignInAndSignUp,
          factors: [],
        },
      },
    });
  });

  it('should reject adaptive mfa when effective mfa policy is mandatory', async () => {
    findDefaultSignInExperience.mockResolvedValueOnce({
      ...mockSignInExperience,
      mfa: {
        policy: MfaPolicy.Mandatory,
        factors: [MfaFactor.TOTP],
      },
    });

    const response = await signInExperienceRequester.patch('/sign-in-exp').send({
      adaptiveMfa: {
        enabled: true,
      },
    });

    expect(response).toMatchObject({
      status: 422,
    });
  });

  it('should guard support email field format', async () => {
    const exception = await signInExperienceRequester
      .patch('/sign-in-exp')
      .send({ supportEmail: 'invalid' });

    expect(exception).toMatchObject({
      status: 400,
    });

    const supportEmail = 'support@logto.io';

    const response = await signInExperienceRequester.patch('/sign-in-exp').send({
      supportEmail,
    });

    expect(response).toMatchObject({
      status: 200,
      body: {
        ...mockSignInExperience,
        supportEmail,
      },
    });
  });

  it('should guard support website URL field format', async () => {
    const exception = await signInExperienceRequester
      .patch('/sign-in-exp')
      .send({ supportWebsiteUrl: 'invalid' });

    expect(exception).toMatchObject({
      status: 400,
    });

    const supportWebsiteUrl = 'https://logto.io';

    const response = await signInExperienceRequester.patch('/sign-in-exp').send({
      supportWebsiteUrl,
    });

    expect(response).toMatchObject({
      status: 200,
      body: {
        ...mockSignInExperience,
        supportWebsiteUrl,
      },
    });
  });

  it('should guard unknown session redirect URL field format', async () => {
    const exception = await signInExperienceRequester
      .patch('/sign-in-exp')
      .send({ unknownSessionRedirectUrl: 'invalid' });

    expect(exception).toMatchObject({
      status: 400,
    });

    const unknownSessionRedirectUrl = 'https://logto.io';

    const response = await signInExperienceRequester.patch('/sign-in-exp').send({
      unknownSessionRedirectUrl,
    });

    expect(response).toMatchObject({
      status: 200,
      body: {
        ...mockSignInExperience,
        unknownSessionRedirectUrl,
      },
    });
  });

  it('should accept empty forgotPasswordMethods array', async () => {
    const response = await signInExperienceRequester.patch('/sign-in-exp').send({
      forgotPasswordMethods: [],
    });

    expect(response).toMatchObject({
      status: 200,
      body: {
        ...mockSignInExperience,
        forgotPasswordMethods: [],
      },
    });
  });
});

describe('sign-in experience routes with dev features disabled', () => {
  it('should include adaptive mfa in GET response', async () => {
    const { requester } = await createDevFeaturesDisabledRequester();

    const response = await requester.get('/sign-in-exp');

    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockSignInExperience);
  });

  it('should ignore adaptive mfa updates', async () => {
    const { requester, updateDefaultSignInExperience } = await createDevFeaturesDisabledRequester();

    const response = await requester.patch('/sign-in-exp').send({ adaptiveMfa: { enabled: true } });

    expect(updateDefaultSignInExperience).toHaveBeenCalledWith({});
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockSignInExperience);
  });
});
