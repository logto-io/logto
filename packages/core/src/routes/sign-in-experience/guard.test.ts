import type { CreateSignInExperience, SignInExperience } from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';

import { mockLanguageInfo, mockSignInExperience } from '#src/__mocks__/index.js';
import { MockTenant } from '#src/test-utils/tenant.test.js';

const { jest } = import.meta;

const validateLanguageInfo = jest.fn();

const tenantContext = new MockTenant(
  undefined,
  {
    signInExperiences: {
      updateDefaultSignInExperience: async (
        data: Partial<CreateSignInExperience>
      ): Promise<SignInExperience> => ({
        ...mockSignInExperience,
        ...data,
      }),
    },
  },
  {
    signInExperiences: {
      validateLanguageInfo,
    },
  }
);

const signInExperiencesRoutes = await pickDefault(import('./index.js'));
const { createRequester } = await import('#src/utils/test-utils.test.js');
const signInExperienceRequester = createRequester({
  authedRoutes: signInExperiencesRoutes,
  tenantContext,
});

const expectPatchResponseStatus = async (
  signInExperience: Record<string, unknown>,
  status: number
) => {
  const response = await signInExperienceRequester.patch('/sign-in-exp').send(signInExperience);
  expect(response.status).toEqual(status);
};

const validBooleans = [true, false];
const invalidBooleans = [undefined, null, 0, 1, '0', '1', 'true', 'false'];

beforeEach(() => {
  jest.clearAllMocks();
});

describe('terms of use url', () => {
  describe('termsOfUseUrl', () => {
    test.each([undefined, null, '', 'http://silverhand.com/terms', 'https://logto.dev/terms'])(
      '%p should success',
      async (termsOfUseUrl) => {
        const signInExperience = {
          termsOfUseUrl,
        };
        await expectPatchResponseStatus(signInExperience, 200);
      }
    );

    test.each([' \t\n\r', 'non-url'])('%p should fail', async (termsOfUseUrl) => {
      const signInExperience = { termsOfUseUrl };
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

  const validLanguages = ['en', 'pt-PT', 'zh-HK', 'zh-TW'];
  const invalidLanguages = [undefined, null, '', ' \t\n\r', 'ab', 'xx-XX'];

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

  it('should call validateLanguageInfo', async () => {
    const signInExperience = { languageInfo: mockLanguageInfo };
    await expectPatchResponseStatus(signInExperience, 200);
    expect(validateLanguageInfo).toBeCalledWith(mockLanguageInfo);
  });
});

describe('socialSignInConnectorTargets', () => {
  test.each([[['facebook']], [['facebook', 'github']]])(
    '%p should success',
    async (socialSignInConnectorTargets) => {
      await expectPatchResponseStatus(
        {
          socialSignInConnectorTargets,
        },
        200
      );
    }
  );
});
