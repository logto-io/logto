import {
  SignInExperience,
  CreateSignInExperience,
  Branding,
  TermsOfUse,
  SignInMethods,
  SignInMethodState,
} from '@logto/schemas';

import {
  mockBranding,
  mockFacebookConnectorInstance,
  mockGithubConnectorInstance,
  mockGoogleConnectorInstance,
  mockSignInExperience,
  mockSignInMethods,
} from '@/utils/mock';
import { createRequester } from '@/utils/test-utils';

import signInExperiencesRoutes from './sign-in-experience';

const getConnectorInstances = jest.fn(async () => [
  mockFacebookConnectorInstance,
  mockGithubConnectorInstance,
  mockGoogleConnectorInstance,
]);

jest.mock('@/connectors', () => ({
  ...jest.requireActual('@/connectors'),
  getConnectorInstances: jest.fn(async () => getConnectorInstances()),
  getEnabledSocialConnectorIds: jest.fn(async () => ['facebook', 'github']),
}));

jest.mock('@/queries/sign-in-experience', () => ({
  findDefaultSignInExperience: jest.fn(async (): Promise<SignInExperience> => mockSignInExperience),
  updateDefaultSignInExperience: jest.fn(
    async (data: Partial<CreateSignInExperience>): Promise<SignInExperience> => ({
      ...mockSignInExperience,
      ...data,
    })
  ),
}));

const validateBranding = jest.fn();
const validateTermsOfUse = jest.fn();
const validateSignInMethods = jest.fn();

jest.mock('@/utils/validate-sign-in-experience', () => ({
  ...jest.requireActual('@/utils/validate-sign-in-experience'),
  validateBranding: (branding: Branding | undefined) => {
    validateBranding(branding);
  },
  validateTermsOfUse: (termsOfUse: TermsOfUse | undefined) => {
    validateTermsOfUse(termsOfUse);
  },
  validateSignInMethods: (signInMethods: SignInMethods | undefined) => {
    validateSignInMethods(signInMethods);
  },
}));

const signInExperienceRequester = createRequester({ authedRoutes: signInExperiencesRoutes });

it('GET /sign-in-exp', async () => {
  const response = await signInExperienceRequester.get('/sign-in-exp');
  expect(response.status).toEqual(200);
  expect(response.body).toEqual(mockSignInExperience);
});

describe('PATCH /sign-in-exp', () => {
  it('should not update social connector ids when disabled social sign-in', async () => {
    const signInMethods = { ...mockSignInMethods, social: SignInMethodState.disabled };
    const response = await signInExperienceRequester.patch('/sign-in-exp').send({
      signInMethods,
      socialSignInConnectorIds: ['facebook'],
    });
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      ...mockSignInExperience,
      signInMethods,
    });
  });

  it('should update enabled social connector ids when enabled social sign-in', async () => {
    const signInMethods = { ...mockSignInMethods, social: SignInMethodState.secondary };
    const socialSignInConnectorIds = ['facebook'];
    const signInExperience = {
      signInMethods,
      socialSignInConnectorIds,
    };
    const response = await signInExperienceRequester.patch('/sign-in-exp').send(signInExperience);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      ...mockSignInExperience,
      signInMethods,
      socialSignInConnectorIds,
    });
  });

  it('should update social connector ids in correct sorting order', async () => {
    const signInMethods = { ...mockSignInMethods, social: SignInMethodState.secondary };
    const socialSignInConnectorIds = ['github', 'facebook'];
    const signInExperience = {
      signInMethods,
      socialSignInConnectorIds,
    };
    const response = await signInExperienceRequester.patch('/sign-in-exp').send(signInExperience);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      ...mockSignInExperience,
      signInMethods,
      socialSignInConnectorIds,
    });
  });

  it('should succeed to update when the input is valid', async () => {
    const termsOfUse: TermsOfUse = { enabled: false };
    const socialSignInConnectorIds = ['abc', 'def'];

    const response = await signInExperienceRequester.patch('/sign-in-exp').send({
      branding: mockBranding,
      termsOfUse,
      signInMethods: mockSignInMethods,
      socialSignInConnectorIds,
    });

    expect(validateBranding).toHaveBeenCalledWith(mockBranding);
    expect(validateTermsOfUse).toHaveBeenCalledWith(termsOfUse);
    expect(validateSignInMethods).toHaveBeenCalledWith(mockSignInMethods);

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      ...mockSignInExperience,
      branding: mockBranding,
      termsOfUse,
      signInMethods: mockSignInMethods,
      socialSignInConnectorIds,
    });
  });
});
