import type { SignInExperience, CreateSignInExperience } from '@logto/schemas';
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

const tenantContext = new MockTenant(
  undefined,
  { signInExperiences, customPhrases: { findAllCustomLanguageTags: async () => [] } },
  {
    signInExperiences: { validateLanguageInfo },
    connectors: { getLogtoConnectors: async () => logtoConnectors },
  }
);

const signInExperiencesRoutes = await pickDefault(import('./index.js'));
const signInExperienceRequester = createRequester({
  authedRoutes: signInExperiencesRoutes,
  tenantContext,
});

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
    expect(validateSignIn).toHaveBeenCalledWith(mockSignIn, mockSignUp, logtoConnectors);

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
});
