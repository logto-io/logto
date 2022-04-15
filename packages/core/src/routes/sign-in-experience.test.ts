import {
  SignInExperience,
  CreateSignInExperience,
  TermsOfUse,
  SignInMethodState,
} from '@logto/schemas';

import {
  mockFacebookConnectorInstance,
  mockGithubConnectorInstance,
  mockGoogleConnectorInstance,
  mockBranding,
  mockSignInExperience,
  mockSignInMethods,
} from '@/__mocks__';
import * as signInExpLib from '@/lib/sign-in-experience';
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

  it('should filter enabled social connectors', async () => {
    const signInExperience = {
      ...mockSignInExperience,
      signInMethods: { ...mockSignInMethods, social: SignInMethodState.Secondary },
      socialSignInConnectorIds: ['facebook', 'github', 'google'],
    };

    findDefaultSignInExperience.mockImplementationOnce(async () => signInExperience);

    const response = await signInExperienceRequester.get('/sign-in-exp');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      ...signInExperience,
      socialSignInConnectorIds: ['facebook', 'github'],
    });
  });
});

describe('GET /sign-in-settings', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should call findDefaultSignInExperience', async () => {
    const response = await signInExperienceRequester.get('/sign-in-settings');
    expect(findDefaultSignInExperience).toHaveBeenCalledTimes(1);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockSignInExperience);
  });
});

describe('PATCH /sign-in-exp', () => {
  it('should not update social connector ids when social sign-in is disabled', async () => {
    const signInMethods = { ...mockSignInMethods, social: SignInMethodState.Disabled };
    const response = await signInExperienceRequester.patch('/sign-in-exp').send({
      signInMethods,
      socialSignInConnectorIds: ['facebook'],
    });
    expect(response).toMatchObject({
      status: 200,
      body: {
        ...mockSignInExperience,
        signInMethods,
      },
    });
  });

  it('should update enabled social connector IDs only when social sign-in is enabled', async () => {
    const signInMethods = { ...mockSignInMethods, social: SignInMethodState.Secondary };
    const socialSignInConnectorIds = ['facebook'];
    const signInExperience = {
      signInMethods,
      socialSignInConnectorIds,
    };
    const response = await signInExperienceRequester.patch('/sign-in-exp').send(signInExperience);
    expect(response).toMatchObject({
      status: 200,
      body: {
        ...mockSignInExperience,
        signInMethods,
        socialSignInConnectorIds,
      },
    });
  });

  it('should update social connector IDs in correct sorting order', async () => {
    const signInMethods = { ...mockSignInMethods, social: SignInMethodState.Secondary };
    const socialSignInConnectorIds = ['github', 'facebook'];
    const signInExperience = {
      signInMethods,
      socialSignInConnectorIds,
    };
    const response = await signInExperienceRequester.patch('/sign-in-exp').send(signInExperience);
    expect(response).toMatchObject({
      status: 200,
      body: {
        ...mockSignInExperience,
        signInMethods,
        socialSignInConnectorIds,
      },
    });
  });

  it('should succeed to update when the input is valid', async () => {
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
});
