import { BrandingStyle, CreateSignInExperience, SignInExperience } from '@logto/schemas';

import { mockBranding, mockSignInExperience } from '@/utils/mock';
import { createRequester } from '@/utils/test-utils';

import signInExperiencesRoutes from './sign-in-experience';

jest.mock('@/queries/sign-in-experience', () => ({
  updateDefaultSignInExperience: jest.fn(
    async (data: Partial<CreateSignInExperience>): Promise<SignInExperience> => ({
      ...mockSignInExperience,
      ...data,
    })
  ),
}));

const signInExperienceRequester = createRequester({ authedRoutes: signInExperiencesRoutes });

const expectPatchResponseStatus = async (signInExperience: any, status: number) => {
  const response = await signInExperienceRequester.patch('/sign-in-exp').send(signInExperience);
  expect(response.status).toEqual(status);
};

describe('branding', () => {
  const invalidColors = [
    undefined,
    null,
    '',
    '#',
    '#1',
    '#2B',
    '#3cZ',
    '#4D9e',
    '#5f80E',
    '#6GHiXY',
    '#78Cb5dA',
    'rgb(0,13,255)',
  ];

  const validColors = ['#aB3', '#169deF'];

  describe('primaryColor', () => {
    test.each(validColors)('%p should succeed', async (primaryColor) => {
      const signInExperience = { branding: { ...mockBranding, primaryColor } };
      await expectPatchResponseStatus(signInExperience, 200);
    });
    test.each(invalidColors)('%p should fail', async (primaryColor) => {
      const signInExperience = { branding: { ...mockBranding, primaryColor } };
      await expectPatchResponseStatus(signInExperience, 400);
    });
  });

  describe('backgroundColor', () => {
    test.each(validColors)('%p should succeed', async (backgroundColor) => {
      const signInExperience = { branding: { ...mockBranding, backgroundColor } };
      await expectPatchResponseStatus(signInExperience, 200);
    });
    test.each(invalidColors)('%p should fail', async (backgroundColor) => {
      const signInExperience = { branding: { ...mockBranding, backgroundColor } };
      await expectPatchResponseStatus(signInExperience, 400);
    });
  });

  describe('darkPrimaryColor', () => {
    test.each(validColors)('%p should succeed', async (darkPrimaryColor) => {
      const signInExperience = { branding: { ...mockBranding, darkPrimaryColor } };
      await expectPatchResponseStatus(signInExperience, 200);
    });
    test.each(invalidColors)('%p should fail', async (darkPrimaryColor) => {
      const signInExperience = { branding: { ...mockBranding, darkPrimaryColor } };
      await expectPatchResponseStatus(signInExperience, 400);
    });
  });

  describe('darkBackgroundColor', () => {
    test.each(validColors)('%p should succeed', async (darkBackgroundColor) => {
      const signInExperience = { branding: { ...mockBranding, darkBackgroundColor } };
      await expectPatchResponseStatus(signInExperience, 200);
    });
    test.each(invalidColors)('%p should fail', async (darkBackgroundColor) => {
      const signInExperience = { branding: { ...mockBranding, darkBackgroundColor } };
      await expectPatchResponseStatus(signInExperience, 400);
    });
  });

  describe('style', () => {
    test.each(Object.values(BrandingStyle))('%p should succeed', async (style) => {
      const signInExperience = { branding: { ...mockBranding, style } };
      await expectPatchResponseStatus(signInExperience, 200);
    });

    test.each([undefined, '', 'invalid'])('%p should fail', async (style) => {
      const signInExperience = { branding: { ...mockBranding, style } };
      await expectPatchResponseStatus(signInExperience, 400);
    });
  });

  describe('logoUrl', () => {
    test.each(['http://silverhand.com/silverhand.png', 'https://logto.dev/logto.jpg'])(
      '%p should success',
      async (logoUrl) => {
        const signInExperience = { branding: { ...mockBranding, logoUrl } };
        await expectPatchResponseStatus(signInExperience, 200);
      }
    );

    test.each([undefined, null, '', 'invalid'])('%p should fail', async (logoUrl) => {
      const signInExperience = { branding: { ...mockBranding, logoUrl } };
      await expectPatchResponseStatus(signInExperience, 400);
    });
  });

  describe('slogan', () => {
    test.each([undefined, 'Silverhand.', 'Supercharge innovations.'])(
      '%p should success',
      async (slogan) => {
        const signInExperience = {
          branding: {
            ...mockBranding,
            style: BrandingStyle.Logo,
            slogan,
          },
        };
        await expectPatchResponseStatus(signInExperience, 200);
      }
    );

    test.each([null, ''])('%p should fail', async (slogan) => {
      const signInExperience = {
        branding: {
          ...mockBranding,
          style: BrandingStyle.Logo,
          slogan,
        },
      };
      await expectPatchResponseStatus(signInExperience, 400);
    });
  });

  it('should succeed when branding is valid', async () => {
    const response = signInExperienceRequester
      .patch('/sign-in-exp')
      .send({ branding: mockBranding });
    await expect(response).resolves.toMatchObject({ status: 200 });
  });
});
