import { SignInExperience, CreateSignInExperience, TermsOfUse } from '@logto/schemas';

import * as signInExpLib from '@/lib/sign-in-experience';
import { mockBranding, mockSignInExperience } from '@/utils/mock';
import { createRequester } from '@/utils/test-utils';

import signInExperiencesRoutes from './sign-in-experience';

jest.mock('@/connectors', () => ({
  ...jest.requireActual('@/connectors'),
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
    const socialSignInConnectorIds = ['abc', 'def'];

    const validateBranding = jest.spyOn(signInExpLib, 'validateBranding');
    const validateTermsOfUse = jest.spyOn(signInExpLib, 'validateTermsOfUse');

    const response = await signInExperienceRequester.patch('/sign-in-exp').send({
      branding: mockBranding,
      termsOfUse,
      socialSignInConnectorIds,
    });

    expect(validateBranding).toHaveBeenCalledWith(mockBranding);
    expect(validateTermsOfUse).toHaveBeenCalledWith(termsOfUse);

    expect(response).toMatchObject({
      status: 200,
      body: {
        ...mockSignInExperience,
        branding: mockBranding,
        termsOfUse,
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
