import type { SignInExperience, CreateSignInExperience } from '@logto/schemas';
import { mockEsm, mockEsmWithActual, pickDefault } from '@logto/shared/esm';

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
} from '#src/__mocks__/index.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const { validateBranding, validateLanguageInfo, validateSignIn, validateSignUp } =
  await mockEsmWithActual('#src/libraries/sign-in-experience/index.js', () => ({
    validateBranding: jest.fn(),
    validateLanguageInfo: jest.fn(),
    validateSignIn: jest.fn(),
    validateSignUp: jest.fn(),
  }));

const logtoConnectors = [
  mockFacebookConnector,
  mockGithubConnector,
  mockGoogleConnector,
  mockWechatConnector,
  mockAliyunSmsConnector,
];

await mockEsmWithActual('#src/connectors.js', () => ({
  getLogtoConnectors: async () => logtoConnectors,
}));

const { findDefaultSignInExperience } = mockEsm('#src/queries/sign-in-experience.js', () => ({
  findDefaultSignInExperience: jest.fn(async () => mockSignInExperience),
  updateDefaultSignInExperience: async (
    data: Partial<CreateSignInExperience>
  ): Promise<SignInExperience> => ({
    ...mockSignInExperience,
    ...data,
  }),
}));

mockEsm('#src/queries/custom-phrase.js', () => ({
  findAllCustomLanguageTags: async () => [],
}));

const signInExperiencesRoutes = await pickDefault(import('./sign-in-experience.js'));
const signInExperienceRequester = createRequester({ authedRoutes: signInExperiencesRoutes });

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
      socialSignInConnectorTargets,
      signUp: mockSignUp,
      signIn: mockSignIn,
    });

    expect(validateBranding).toHaveBeenCalledWith(mockBranding);
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
        socialSignInConnectorTargets,
        signIn: mockSignIn,
      },
    });
  });
});
