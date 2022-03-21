import { SignInExperience, CreateSignInExperience, BrandingStyle, Branding } from '@logto/schemas';

import { mockSignInExperience } from '@/utils/mock';
import { createRequester } from '@/utils/test-utils';

import signInExperiencesRoutes from './sign-in-experience';

jest.mock('@/connectors', () => ({
  ...jest.requireActual('@/connectors'),
  getEnabledSocialConnectorIds: jest.fn(async () => ['facebook', 'github']),
}));

jest.mock('@/queries/sign-in-experience', () => ({
  findDefaultSignInExperience: jest.fn(async (): Promise<SignInExperience> => mockSignInExperience),
  updateSignInExperienceById: jest.fn(
    async (_, data: Partial<CreateSignInExperience>): Promise<SignInExperience> => ({
      ...mockSignInExperience,
      ...data,
    })
  ),
}));

describe('signInExperiences routes', () => {
  const signInExperienceRequester = createRequester({ authedRoutes: signInExperiencesRoutes });

  it('GET /sign-in-exp', async () => {
    const response = await signInExperienceRequester.get('/sign-in-exp');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockSignInExperience);
  });

  it('PATCH /sign-in-exp/:id', async () => {
    const branding: Branding = {
      primaryColor: '#000',
      backgroundColor: '#fff',
      darkMode: true,
      darkBackgroundColor: '#000',
      darkPrimaryColor: '#fff',
      style: BrandingStyle.Logo,
      logoUrl: 'http://silverhand.png',
      slogan: 'silverhand',
    };

    const socialSignInConnectorIds = ['abc', 'def'];

    const response = await signInExperienceRequester.patch('/sign-in-exp/default').send({
      branding,
      socialSignInConnectorIds,
    });

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      ...mockSignInExperience,
      branding,
      socialSignInConnectorIds,
    });
  });

  it('PATCH /sign-in-exp/:id should throw with invalid inputs', async () => {
    const socialSignInConnectorIds = [123, 456];

    const response = await signInExperienceRequester.patch('/sign-in-exp/default').send({
      socialSignInConnectorIds,
    });
    expect(response.status).toEqual(400);
  });
});
