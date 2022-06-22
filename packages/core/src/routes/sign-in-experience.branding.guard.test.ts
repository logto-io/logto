import { BrandingStyle, CreateSignInExperience, SignInExperience } from '@logto/schemas';

import { mockBranding, mockSignInExperience } from '@/__mocks__';
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

jest.mock('@/connectors', () => ({
  getConnectorInstances: jest.fn(async () => []),
}));

const signInExperienceRequester = createRequester({ authedRoutes: signInExperiencesRoutes });

const expectPatchResponseStatus = async (signInExperience: any, status: number) => {
  const response = await signInExperienceRequester.patch('/sign-in-exp').send(signInExperience);
  expect(response.status).toEqual(status);
};

describe('branding', () => {
  const colorKeys = ['primaryColor', 'darkPrimaryColor'];
  const invalidColors = [null, '#0'];

  describe('colors', () => {
    test.each(invalidColors)('should fail when color is %p', async (invalidColor) => {
      for (const colorKey of colorKeys) {
        // eslint-disable-next-line no-await-in-loop
        await expectPatchResponseStatus(
          { branding: { ...mockBranding, [colorKey]: invalidColor } },
          400
        );
      }
    });
    it('should succeed when color is valid', async () => {
      for (const colorKey of colorKeys) {
        // eslint-disable-next-line no-await-in-loop
        await expectPatchResponseStatus(
          { branding: { ...mockBranding, [colorKey]: '#169deF' } },
          200
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

    test.each([null])('%p should fail', async (slogan) => {
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
    await expectPatchResponseStatus({ branding: mockBranding }, 200);
  });
});
