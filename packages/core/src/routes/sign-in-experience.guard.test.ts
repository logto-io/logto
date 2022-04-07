import { BrandingStyle, CreateSignInExperience, Language, SignInExperience } from '@logto/schemas';

import { mockBranding, mockLanguageInfo, mockSignInExperience, mockTermsOfUse } from '@/utils/mock';
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

const validBooleans = [true, false];
const invalidBooleans = [undefined, null, 0, 1, '0', '1', 'true', 'false'];

describe('branding', () => {
  const colorKeys = ['primaryColor', 'backgroundColor', 'darkPrimaryColor', 'darkBackgroundColor'];

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

describe('terms of use', () => {
  describe('enabled', () => {
    test.each(validBooleans)('%p should success', async (enabled) => {
      const signInExperience = { termsOfUse: { ...mockTermsOfUse, enabled } };
      await expectPatchResponseStatus(signInExperience, 200);
    });

    test.each(invalidBooleans)('%p should fail', async (enabled) => {
      const signInExperience = { termsOfUse: { ...mockTermsOfUse, enabled } };
      await expectPatchResponseStatus(signInExperience, 400);
    });
  });

  describe('contentUrl', () => {
    test.each([undefined, 'http://silverhand.com/terms', 'https://logto.dev/terms'])(
      '%p should success',
      async (contentUrl) => {
        const signInExperience = { termsOfUse: { ...mockTermsOfUse, enabled: false, contentUrl } };
        await expectPatchResponseStatus(signInExperience, 200);
      }
    );

    test.each([null, '', ' \t\n\r', 'non-url'])('%p should fail', async (contentUrl) => {
      const signInExperience = { termsOfUse: { ...mockTermsOfUse, enabled: false, contentUrl } };
      await expectPatchResponseStatus(signInExperience, 400);
    });
  });
});

describe('languageInfo', () => {
  describe('autoDetect', () => {
    test.each(validBooleans)('%p should success', async (autoDetect) => {
      const signInExperience = { languageInfo: { ...mockLanguageInfo, autoDetect } };
      await expectPatchResponseStatus(signInExperience, 200);
    });

    test.each(invalidBooleans)('%p should fail', async (autoDetect) => {
      const signInExperience = { languageInfo: { ...mockLanguageInfo, autoDetect } };
      await expectPatchResponseStatus(signInExperience, 400);
    });
  });

  const validLanguages = Object.values(Language);
  const invalidLanguages = [undefined, null, '', ' \t\n\r', 'abc'];

  describe('fallbackLanguage', () => {
    test.each(validLanguages)('%p should success', async (fallbackLanguage) => {
      const signInExperience = { languageInfo: { ...mockLanguageInfo, fallbackLanguage } };
      await expectPatchResponseStatus(signInExperience, 200);
    });

    test.each(invalidLanguages)('%p should fail', async (fallbackLanguage) => {
      const signInExperience = { languageInfo: { ...mockLanguageInfo, fallbackLanguage } };
      await expectPatchResponseStatus(signInExperience, 400);
    });
  });

  describe('fixedLanguage', () => {
    test.each(validLanguages)('%p should success', async (fixedLanguage) => {
      const signInExperience = { languageInfo: { ...mockLanguageInfo, fixedLanguage } };
      await expectPatchResponseStatus(signInExperience, 200);
    });

    test.each(invalidLanguages)('%p should fail', async (fixedLanguage) => {
      const signInExperience = { languageInfo: { ...mockLanguageInfo, fixedLanguage } };
      await expectPatchResponseStatus(signInExperience, 400);
    });
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
