import { SignInExperience, CreateSignInExperience, TermsOfUse } from '@logto/schemas';

import * as signInExpLib from '@/lib/sign-in-experience';
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

const connectorInstances = [
  mockFacebookConnectorInstance,
  mockGithubConnectorInstance,
  mockGoogleConnectorInstance,
];

const getConnectorInstances = jest.fn(async () => connectorInstances);

jest.mock('@/connectors', () => {
  return {
    ...jest.requireActual('@/connectors'),
    getEnabledSocialConnectorIds: jest.fn(async () => ['facebook', 'github']),
    getConnectorInstances: jest.fn(async () => getConnectorInstances()),
  };
});

jest.mock('@/queries/sign-in-experience', () => ({
  findDefaultSignInExperience: jest.fn(async (): Promise<SignInExperience> => mockSignInExperience),
  updateDefaultSignInExperience: jest.fn(
    async (data: Partial<CreateSignInExperience>): Promise<SignInExperience> => ({
      ...mockSignInExperience,
      ...data,
    })
  ),
}));

describe('signInExperiences routes', () => {
  const signInExperienceRequester = createRequester({ authedRoutes: signInExperiencesRoutes });

  it('GET /sign-in-exp', async () => {
    const response = await signInExperienceRequester.get('/sign-in-exp');
    expect(response).toMatchObject({
      status: 200,
      body: mockSignInExperience,
    });
  });

  it('PATCH /sign-in-exp', async () => {
    const termsOfUse: TermsOfUse = { enabled: false };
    const socialSignInConnectorIds = ['github', 'facebook'];

    const validateBranding = jest.spyOn(signInExpLib, 'validateBranding');
    const validateTermsOfUse = jest.spyOn(signInExpLib, 'validateTermsOfUse');
    const validateSignInMethods = jest.spyOn(signInExpLib, 'validateSignInMethods');

    const response = await signInExperienceRequester.patch('/sign-in-exp').send({
      branding: mockBranding,
      termsOfUse,
      signInMethods: mockSignInMethods,
      socialSignInConnectorIds,
    });

    expect(validateBranding).toHaveBeenCalledWith(mockBranding);
    expect(validateTermsOfUse).toHaveBeenCalledWith(termsOfUse);
    expect(validateSignInMethods).toHaveBeenCalledWith(
      mockSignInMethods,
      socialSignInConnectorIds,
      [mockFacebookConnectorInstance, mockGithubConnectorInstance]
    );
    // TODO: only update socialSignInConnectorIds when social sign-in is enabled.

    expect(response).toMatchObject({
      status: 200,
      body: {
        ...mockSignInExperience,
        branding: mockBranding,
        termsOfUse,
        signInMethods: mockSignInMethods,
        socialSignInConnectorIds,
      },
    });
  });

  it('PATCH /sign-in-exp should throw with invalid inputs', async () => {
    const socialSignInConnectorIds = [123, 456];

    const response = await signInExperienceRequester.patch('/sign-in-exp').send({
      socialSignInConnectorIds,
    });
    expect(response.status).toEqual(400);
  });
});
