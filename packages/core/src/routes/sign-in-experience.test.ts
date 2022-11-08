import type { SignInExperience, CreateSignInExperience } from '@logto/schemas';

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
} from '@/__mocks__';
import * as signInExpLib from '@/lib/sign-in-experience';
import * as signInLib from '@/lib/sign-in-experience/sign-in';
import * as signUpLib from '@/lib/sign-in-experience/sign-up';
import { createRequester } from '@/utils/test-utils';

import signInExperiencesRoutes from './sign-in-experience';

const logtoConnectors = [
  mockFacebookConnector,
  mockGithubConnector,
  mockGoogleConnector,
  mockWechatConnector,
  mockAliyunSmsConnector,
];

const getLogtoConnectors = jest.fn(async () => logtoConnectors);

jest.mock('@/connectors', () => {
  return {
    ...jest.requireActual('@/connectors'),
    getLogtoConnectors: jest.fn(async () => getLogtoConnectors()),
  };
});

const findDefaultSignInExperience = jest.fn(async () => mockSignInExperience);

jest.mock('@/queries/sign-in-experience', () => ({
  findDefaultSignInExperience: jest.fn(async () => findDefaultSignInExperience()),
  updateDefaultSignInExperience: jest.fn(
    async (data: Partial<CreateSignInExperience>): Promise<SignInExperience> => ({
      ...mockSignInExperience,
      ...data,
    })
  ),
}));

const signInExperienceRequester = createRequester({ authedRoutes: signInExperiencesRoutes });

jest.mock('@/queries/custom-phrase', () => ({
  findAllCustomLanguageTags: async () => [],
}));

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
        socialSignInConnectorTargets: ['github', 'facebook'],
      },
    });
  });

  it('should succeed to update when the input is valid', async () => {
    const termsOfUseUrl = mockTermsOfUseUrl;
    const socialSignInConnectorTargets = ['github', 'facebook', 'wechat'];

    const validateBranding = jest.spyOn(signInExpLib, 'validateBranding');
    const validateLanguageInfo = jest.spyOn(signInExpLib, 'validateLanguageInfo');
    const validateSignIn = jest.spyOn(signInLib, 'validateSignIn');
    const validateSignUp = jest.spyOn(signUpLib, 'validateSignUp');

    const response = await signInExperienceRequester.patch('/sign-in-exp').send({
      color: mockColor,
      branding: mockBranding,
      languageInfo: mockLanguageInfo,
      termsOfUseUrl,
      socialSignInConnectorTargets,
      signUp: mockSignUp,
      signIn: mockSignIn,
    });
    const connectors = [
      mockFacebookConnector,
      mockGithubConnector,
      mockWechatConnector,
      mockAliyunSmsConnector,
    ];

    expect(validateBranding).toHaveBeenCalledWith(mockBranding);
    expect(validateLanguageInfo).toHaveBeenCalledWith(mockLanguageInfo);
    expect(validateSignUp).toHaveBeenCalledWith(mockSignUp, connectors);
    expect(validateSignIn).toHaveBeenCalledWith(mockSignIn, mockSignUp, connectors);

    expect(response).toMatchObject({
      status: 200,
      body: {
        ...mockSignInExperience,
        color: mockColor,
        branding: mockBranding,
        termsOfUseUrl,
        socialSignInConnectorTargets,
        signIn: mockSignIn,
      },
    });
  });
});
