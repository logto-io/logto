import type { SignInExperience, CreateSignInExperience, TermsOfUse } from '@logto/schemas';

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
} from '#src/__mocks__/index.js';
import * as signInExpLib from '#src/lib/sign-in-experience/index.js';
import * as signInLib from '#src/lib/sign-in-experience/sign-in.js';
import * as signUpLib from '#src/lib/sign-in-experience/sign-up.js';
import { createRequester } from '#src/utils/test-utils.js';

import signInExperiencesRoutes from './sign-in-experience.js';

const logtoConnectors = [
  mockFacebookConnector,
  mockGithubConnector,
  mockGoogleConnector,
  mockWechatConnector,
  mockAliyunSmsConnector,
];

const getLogtoConnectors = jest.fn(async () => logtoConnectors);

jest.mock('#src/connectors.js', () => {
  return {
    ...jest.requireActual('#src/connectors.js'),
    getLogtoConnectors: jest.fn(async () => getLogtoConnectors()),
  };
});

const findDefaultSignInExperience = jest.fn(async () => mockSignInExperience);

jest.mock('#src/queries/sign-in-experience.js', () => ({
  findDefaultSignInExperience: jest.fn(async () => findDefaultSignInExperience()),
  updateDefaultSignInExperience: jest.fn(
    async (data: Partial<CreateSignInExperience>): Promise<SignInExperience> => ({
      ...mockSignInExperience,
      ...data,
    })
  ),
}));

const signInExperienceRequester = createRequester({ authedRoutes: signInExperiencesRoutes });

jest.mock('#src/queries/custom-phrase.js', () => ({
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
        socialSignInConnectorTargets: ['github', 'facebook', 'google'],
      },
    });
  });

  it('should succeed to update when the input is valid', async () => {
    const termsOfUse: TermsOfUse = { enabled: false };
    const socialSignInConnectorTargets = ['github', 'facebook', 'wechat'];

    const validateBranding = jest.spyOn(signInExpLib, 'validateBranding');
    const validateLanguageInfo = jest.spyOn(signInExpLib, 'validateLanguageInfo');
    const validateTermsOfUse = jest.spyOn(signInExpLib, 'validateTermsOfUse');
    const validateSignIn = jest.spyOn(signInLib, 'validateSignIn');
    const validateSignUp = jest.spyOn(signUpLib, 'validateSignUp');

    const response = await signInExperienceRequester.patch('/sign-in-exp').send({
      color: mockColor,
      branding: mockBranding,
      languageInfo: mockLanguageInfo,
      termsOfUse,
      socialSignInConnectorTargets,
      signUp: mockSignUp,
      signIn: mockSignIn,
    });

    expect(validateBranding).toHaveBeenCalledWith(mockBranding);
    expect(validateLanguageInfo).toHaveBeenCalledWith(mockLanguageInfo);
    expect(validateTermsOfUse).toHaveBeenCalledWith(termsOfUse);
    expect(validateSignUp).toHaveBeenCalledWith(mockSignUp, logtoConnectors);
    expect(validateSignIn).toHaveBeenCalledWith(mockSignIn, mockSignUp, logtoConnectors);

    expect(response).toMatchObject({
      status: 200,
      body: {
        ...mockSignInExperience,
        color: mockColor,
        branding: mockBranding,
        termsOfUse,
        socialSignInConnectorTargets,
        signIn: mockSignIn,
      },
    });
  });
});
