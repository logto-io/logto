import { SignInExperience, CreateSignInExperience } from '@logto/schemas';

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
    const companyInfo = {
      name: 'silverhand',
      logo: 'http://silverhand.png',
    };
    const signInMethods = {
      primary: ['phone'],
      secondary: ['email'],
      disabled: [],
    };

    const response = await signInExperienceRequester.patch('/sign-in-ex/default').send({
      companyInfo,
      signInMethods,
    });

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      ...mockSignInExperience,
      companyInfo,
      signInMethods,
    });
  });

  it('PATH /sign-in-ex/:id should throw with invalid inputs', async () => {
    const signInMethods = {
      primary: [],
      secondary: ['email'],
      disabled: [],
    };

    const response = await signInExperienceRequester.patch('/sign-in-ex/default').send({
      signInMethods,
    });
    expect(response.status).toEqual(400);
  });
});
