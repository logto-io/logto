/* eslint-disable max-lines */
import {
  MfaFactor,
  MfaPolicy,
  type AccountCenter,
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
import { EnvSet } from '#src/env-set/index.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

type NormalizableProfileFields =
  | SignInExperience['signUpProfileFields']
  | AccountCenter['profileFields']
  | undefined;
type NormalizeProfileFields = <ProfileFields extends NormalizableProfileFields>(
  profileFields: ProfileFields
) => Promise<ProfileFields | undefined>;
type NormalizeProfileFieldsMock = jest.MockedFunction<NormalizeProfileFields>;

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
const originalIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;
const originalIsCloud = EnvSet.values.isCloud;
const originalIsProduction = EnvSet.values.isProduction;

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

const createSignUpProfileFieldsRequester = (
  normalizeProfileFields: NormalizeProfileFieldsMock = jest.fn(
    async <ProfileFields extends NormalizableProfileFields>(profileFields: ProfileFields) =>
      profileFields
  ) as NormalizeProfileFieldsMock
) => {
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
    {
      signInExperiences: { validateLanguageInfo: jest.fn() },
      customProfileFields: { normalizeProfileFields },
    }
  );

  const requester = createRequester({
    authedRoutes: signInExperiencesRoutes,
    tenantContext: tenant,
  });

  return { requester, updateDefaultSignInExperience, normalizeProfileFields };
};

const createCustomUiCspRequester = async ({
  isDevFeaturesEnabled = true,
  isCloud = true,
  isProduction = false,
} = {}) => {
  // eslint-disable-next-line @silverhand/fp/no-mutation -- Toggle EnvSet in this route test without reloading mocked modules.
  (EnvSet.values as { isDevFeaturesEnabled: boolean }).isDevFeaturesEnabled = isDevFeaturesEnabled;
  // eslint-disable-next-line @silverhand/fp/no-mutation -- Toggle EnvSet in this route test without reloading mocked modules.
  (EnvSet.values as { isCloud: boolean }).isCloud = isCloud;
  // eslint-disable-next-line @silverhand/fp/no-mutation -- Toggle EnvSet in this route test without reloading mocked modules.
  (EnvSet.values as { isProduction: boolean }).isProduction = isProduction;

  const updateDefaultSignInExperience = jest.fn(
    async (data: Partial<CreateSignInExperience>): Promise<SignInExperience> => ({
      ...mockSignInExperience,
      ...data,
    })
  );
  const guardTenantUsageByKey = jest.fn(async () => {
    await Promise.resolve();
  });
  const reportSubscriptionUpdatesUsage = jest.fn(async () => {
    await Promise.resolve();
  });
  const requester = createRequester({
    authedRoutes: signInExperiencesRoutes,
    tenantContext: new MockTenant(
      undefined,
      {
        signInExperiences: {
          updateDefaultSignInExperience,
          findDefaultSignInExperience: jest.fn().mockResolvedValue(mockSignInExperience),
        },
        customPhrases: { findAllCustomLanguageTags: async () => [] },
      },
      { getLogtoConnectors: jest.fn().mockResolvedValue([]) },
      {
        signInExperiences: { validateLanguageInfo: jest.fn() },
        quota: { guardTenantUsageByKey, reportSubscriptionUpdatesUsage },
      }
    ),
  });

  return { requester, updateDefaultSignInExperience, guardTenantUsageByKey };
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
      policy: MfaPolicy.PromptAtSignInAndSignUpMandatory,
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
        policy: MfaPolicy.PromptAtSignInAndSignUpMandatory,
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
        policy: MfaPolicy.PromptAtSignInAndSignUpMandatory,
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

  it.each([
    { title: 'mandatory', policy: MfaPolicy.Mandatory },
    { title: 'optional prompt', policy: MfaPolicy.PromptAtSignInAndSignUp },
  ])('should reject adaptive mfa when effective mfa policy is $title', async ({ policy }) => {
    findDefaultSignInExperience.mockResolvedValueOnce({
      ...mockSignInExperience,
      mfa: {
        policy,
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

  it('should reject adaptive mfa policy when adaptive mfa is disabled', async () => {
    const response = await signInExperienceRequester.patch('/sign-in-exp').send({
      adaptiveMfa: {
        enabled: false,
      },
      mfa: {
        policy: MfaPolicy.PromptAtSignInAndSignUpMandatory,
        factors: [MfaFactor.TOTP],
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

  it('should persist adaptive mfa updates when the payload is otherwise valid', async () => {
    const { requester, updateDefaultSignInExperience } = await createDevFeaturesDisabledRequester();

    const adaptiveMfa = { enabled: true };
    const mfa = {
      policy: MfaPolicy.PromptAtSignInAndSignUpMandatory,
      factors: [MfaFactor.TOTP],
    };

    const response = await requester.patch('/sign-in-exp').send({ adaptiveMfa, mfa });

    expect(updateDefaultSignInExperience).toHaveBeenCalledWith({ adaptiveMfa, mfa });
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      ...mockSignInExperience,
      adaptiveMfa,
      mfa,
    });
  });
});

describe('PATCH /sign-in-exp signUpProfileFields', () => {
  it('should omit signUpProfileFields when the normalized value is absent', async () => {
    const { requester, updateDefaultSignInExperience, normalizeProfileFields } =
      createSignUpProfileFieldsRequester();

    const response = await requester.patch('/sign-in-exp').send({});

    expect(normalizeProfileFields).toHaveBeenCalledTimes(1);
    expect(response.status).toEqual(200);
    expect(updateDefaultSignInExperience).toHaveBeenCalledWith({});
    expect(updateDefaultSignInExperience.mock.calls[0]?.[0]).not.toHaveProperty(
      'signUpProfileFields'
    );
  });

  it('should persist normalized signUpProfileFields', async () => {
    const signUpProfileFields = [{ name: 'company' }];
    const normalizedSignUpProfileFields = [{ name: 'inviteCode' }];
    const normalizeProfileFields = jest.fn(
      async <ProfileFields extends NormalizableProfileFields>(_profileFields: ProfileFields) =>
        normalizedSignUpProfileFields as ProfileFields
    ) as NormalizeProfileFieldsMock;
    const { requester, updateDefaultSignInExperience } =
      createSignUpProfileFieldsRequester(normalizeProfileFields);

    const response = await requester.patch('/sign-in-exp').send({ signUpProfileFields });

    expect(normalizeProfileFields).toHaveBeenCalledWith(signUpProfileFields);
    expect(response.status).toEqual(200);
    expect(updateDefaultSignInExperience).toHaveBeenCalledWith({
      signUpProfileFields: normalizedSignUpProfileFields,
    });
    expect(response.body).toMatchObject({ signUpProfileFields: normalizedSignUpProfileFields });
  });

  it('should accept an empty list to collect no custom profile fields during sign-up', async () => {
    const { requester, updateDefaultSignInExperience } = createSignUpProfileFieldsRequester();

    const signUpProfileFields: Array<{ name: string }> = [];
    const response = await requester.patch('/sign-in-exp').send({ signUpProfileFields });

    expect(response.status).toEqual(200);
    expect(updateDefaultSignInExperience).toHaveBeenCalledWith({ signUpProfileFields });
    expect(response.body).toMatchObject({ signUpProfileFields });
  });

  it('should accept null to clear signUpProfileFields', async () => {
    const { requester, updateDefaultSignInExperience } = createSignUpProfileFieldsRequester();

    const response = await requester.patch('/sign-in-exp').send({ signUpProfileFields: null });

    expect(response.status).toEqual(200);
    expect(updateDefaultSignInExperience).toHaveBeenCalledWith({ signUpProfileFields: null });
  });
});

describe('PATCH /sign-in-exp customUiCsp', () => {
  afterEach(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Restore EnvSet after each feature-gate test.
    (EnvSet.values as { isDevFeaturesEnabled: boolean }).isDevFeaturesEnabled =
      originalIsDevFeaturesEnabled;
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Restore EnvSet after each feature-gate test.
    (EnvSet.values as { isCloud: boolean }).isCloud = originalIsCloud;
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Restore EnvSet after each feature-gate test.
    (EnvSet.values as { isProduction: boolean }).isProduction = originalIsProduction;
  });

  it('should normalize and persist valid Custom UI CSP config', async () => {
    const { requester, updateDefaultSignInExperience, guardTenantUsageByKey } =
      await createCustomUiCspRequester();

    const response = await requester.patch('/sign-in-exp').send({
      customUiCsp: {
        scriptSrc: [' https://EXAMPLE.com ', 'https://example.com', 'https://*.example.com/path/'],
        connectSrc: ['wss://api.example.com', 'https://api.example.com'],
      },
    });

    const customUiCsp = {
      scriptSrc: ['https://example.com', 'https://*.example.com/path/'],
      connectSrc: ['wss://api.example.com', 'https://api.example.com'],
    };

    expect(response.status).toEqual(200);
    expect(updateDefaultSignInExperience).toHaveBeenCalledWith({ customUiCsp });
    expect(response.body).toMatchObject({ customUiCsp });
    expect(guardTenantUsageByKey).toHaveBeenCalledWith('bringYourUiEnabled');
  });

  it('should guard Bring Your Own UI quota once when updating branding and Custom UI CSP', async () => {
    const { requester, guardTenantUsageByKey } = await createCustomUiCspRequester();

    const response = await requester.patch('/sign-in-exp').send({
      hideLogtoBranding: true,
      customUiCsp: {
        scriptSrc: ['https://example.com'],
      },
    });

    expect(response.status).toEqual(200);
    expect(guardTenantUsageByKey).toHaveBeenCalledTimes(1);
    expect(guardTenantUsageByKey).toHaveBeenCalledWith('bringYourUiEnabled');
  });

  it.each([
    {
      customUiCsp: { scriptSrc: ["'unsafe-inline'"] },
      title: 'CSP keyword',
    },
    {
      customUiCsp: { scriptSrc: ['https://example.com; report-uri https://evil.test'] },
      title: 'semicolon',
    },
    {
      customUiCsp: { scriptSrc: ['http://example.com'] },
      title: 'unsupported scheme',
    },
    {
      customUiCsp: { connectSrc: ['https://*.*.example.com'] },
      title: 'malformed wildcard host',
    },
    {
      customUiCsp: { imgSrc: ['https://example.com'] },
      title: 'unsupported directive',
    },
  ])('should reject invalid Custom UI CSP config: $title', async ({ customUiCsp }) => {
    const { requester, updateDefaultSignInExperience, guardTenantUsageByKey } =
      await createCustomUiCspRequester();

    const response = await requester.patch('/sign-in-exp').send({ customUiCsp });

    expect(response.status).toEqual(400);
    expect(updateDefaultSignInExperience).not.toHaveBeenCalled();
    expect(guardTenantUsageByKey).not.toHaveBeenCalled();
  });

  it('should reject non-empty Custom UI CSP updates when dev features are disabled', async () => {
    const { requester, updateDefaultSignInExperience, guardTenantUsageByKey } =
      await createCustomUiCspRequester({ isDevFeaturesEnabled: false });

    const response = await requester.patch('/sign-in-exp').send({
      customUiCsp: {
        scriptSrc: ['https://example.com'],
      },
    });

    expect(response.status).toEqual(400);
    expect(updateDefaultSignInExperience).not.toHaveBeenCalled();
    expect(guardTenantUsageByKey).not.toHaveBeenCalled();
  });

  it('should reject non-empty Custom UI CSP updates outside Cloud', async () => {
    const { requester, updateDefaultSignInExperience, guardTenantUsageByKey } =
      await createCustomUiCspRequester({ isCloud: false });

    const response = await requester.patch('/sign-in-exp').send({
      customUiCsp: {
        scriptSrc: ['https://example.com'],
      },
    });

    expect(response.status).toEqual(400);
    expect(updateDefaultSignInExperience).not.toHaveBeenCalled();
    expect(guardTenantUsageByKey).not.toHaveBeenCalled();
  });

  it('should allow clearing Custom UI CSP config without checking quota', async () => {
    const { requester, updateDefaultSignInExperience, guardTenantUsageByKey } =
      await createCustomUiCspRequester({ isDevFeaturesEnabled: false });

    const response = await requester.patch('/sign-in-exp').send({
      customUiCsp: {
        scriptSrc: [],
        connectSrc: [],
      },
    });

    expect(response.status).toEqual(200);
    expect(updateDefaultSignInExperience).toHaveBeenCalledWith({ customUiCsp: {} });
    expect(guardTenantUsageByKey).not.toHaveBeenCalled();
  });

  it('should allow localhost HTTP source only outside production', async () => {
    const { requester } = await createCustomUiCspRequester();

    await expect(
      requester.patch('/sign-in-exp').send({
        customUiCsp: {
          scriptSrc: ['http://localhost:3000'],
        },
      })
    ).resolves.toMatchObject({ status: 200 });

    const productionRequester = await createCustomUiCspRequester({ isProduction: true });

    await expect(
      productionRequester.requester.patch('/sign-in-exp').send({
        customUiCsp: {
          scriptSrc: ['http://localhost:3000'],
        },
      })
    ).resolves.toMatchObject({ status: 400 });
  });
});
/* eslint-enable max-lines */
