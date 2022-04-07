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
  const colorKeys = ['primaryColor', 'backgroundColor', 'darkPrimaryColor', 'darkBackgroundColor'];

  const invalidColors = [
    undefined,
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

  describe('colors', () => {
    test.each(validColors)('%p should succeed', async (validColor) => {
      for (const colorKey of colorKeys) {
        // eslint-disable-next-line no-await-in-loop
        await expectPatchResponseStatus(
          { branding: { ...mockBranding, [colorKey]: validColor } },
          200
        );
      }
    });
    test.each(invalidColors)('%p should fail', async (invalidColor) => {
      for (const colorKey of colorKeys) {
        // eslint-disable-next-line no-await-in-loop
        await expectPatchResponseStatus(
          { branding: { ...mockBranding, [colorKey]: invalidColor } },
          400
        );
      }
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

    test.each([undefined, '', 'invalid'])('%p should fail', async (logoUrl) => {
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

    it('should fail when it is empty string', async () => {
      const signInExperience = {
        branding: {
          ...mockBranding,
          style: BrandingStyle.Logo,
          slogan: '',
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

describe('socialSignInConnectorIds', () => {
  it('should throw when the type of social connector IDs is wrong', async () => {
    const socialSignInConnectorIds = [123, 456];
    const response = await signInExperienceRequester.patch('/sign-in-exp').send({
      socialSignInConnectorIds,
    });
    expect(response.status).toEqual(400);
  });
});
