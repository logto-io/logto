import { SignInExperience, CreateSignInExperience, BrandingStyle, Branding } from '@logto/schemas';

import { mockSignInExperience } from '@/utils/mock';
import { createRequester } from '@/utils/test-utils';

import signInExperiencesRoutes from './sign-in-experience';

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

  it('GET /sign-in-ex', async () => {
    const response = await signInExperienceRequester.get('/sign-in-ex');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockSignInExperience);
  });

  it('PATCH /sign-in-ex/:id', async () => {
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

    const response = await signInExperienceRequester.patch('/sign-in-ex/default').send({
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

  it('PATH /sign-in-ex/:id should throw with invalid inputs', async () => {
    const socialSignInConnectorIds = [123, 456];

    const response = await signInExperienceRequester.patch('/sign-in-ex/default').send({
      socialSignInConnectorIds,
    });
    expect(response.status).toEqual(400);
  });
});
