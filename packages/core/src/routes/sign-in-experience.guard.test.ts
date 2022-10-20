import {
  CreateSignInExperience,
  LanguageInfo,
  SignInExperience,
  SignInMethodState,
} from '@logto/schemas';

import {
  mockAliyunDmConnector,
  mockAliyunSmsConnector,
  mockFacebookConnector,
  mockGithubConnector,
  mockGoogleConnector,
  mockLanguageInfo,
  mockSignInExperience,
  mockSignInMethods,
  mockTermsOfUse,
} from '@/__mocks__';
import { createRequester } from '@/utils/test-utils';

import signInExperiencesRoutes from './sign-in-experience';

jest.mock('@/connectors', () => ({
  getLogtoConnectors: jest.fn(async () => [
    mockAliyunDmConnector,
    mockAliyunSmsConnector,
    mockFacebookConnector,
    mockGithubConnector,
    mockGoogleConnector,
  ]),
}));

// eslint-disable-next-line @typescript-eslint/no-empty-function
const validateLanguageInfo = jest.fn(async (languageInfo: LanguageInfo): Promise<void> => {});

jest.mock('@/lib/sign-in-experience', () => ({
  ...jest.requireActual('@/lib/sign-in-experience'),
  validateLanguageInfo: async (languageInfo: LanguageInfo) => validateLanguageInfo(languageInfo),
}));

jest.mock('@/queries/sign-in-experience', () => ({
  updateDefaultSignInExperience: jest.fn(
    async (data: Partial<CreateSignInExperience>): Promise<SignInExperience> => ({
      ...mockSignInExperience,
      ...data,
    })
  ),
}));

const signInExperienceRequester = createRequester({ authedRoutes: signInExperiencesRoutes });

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

    test.each([null, ' \t\n\r', 'non-url'])('%p should fail', async (contentUrl) => {
      const signInExperience = { termsOfUse: { ...mockTermsOfUse, enabled: false, contentUrl } };
      await expectPatchResponseStatus(signInExperience, 400);
    });

    test('should allow empty contentUrl if termsOfUse is disabled', async () => {
      const signInExperience = {
        termsOfUse: { ...mockTermsOfUse, enabled: false, contentUrl: '' },
      };
      await expectPatchResponseStatus(signInExperience, 200);
    });

    test('should not allow empty contentUrl if termsOfUse is enabled', async () => {
      const signInExperience = {
        termsOfUse: { ...mockTermsOfUse, enabled: true, contentUrl: '' },
      };
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

describe('signInMethods', () => {
  const validSignInMethodStates = Object.values(SignInMethodState);
  const invalidSignInMethodStates = [undefined, null, '', ' \t\n\r', 'invalid'];

  describe('username', () => {
    test.each(validSignInMethodStates)('%p should success', async (state) => {
      if (state === SignInMethodState.Primary) {
        return;
      }
      const signInExperience = {
        signInMethods: {
          username: state,
          email: SignInMethodState.Primary,
          sms: SignInMethodState.Disabled,
          social: SignInMethodState.Disabled,
        },
      };
      await expectPatchResponseStatus(signInExperience, 200);
    });

    test.each(invalidSignInMethodStates)('%p should fail', async (state) => {
      if (state === SignInMethodState.Primary) {
        return;
      }
      const signInExperience = {
        signInMethods: {
          username: state,
          email: SignInMethodState.Primary,
          sms: SignInMethodState.Disabled,
          social: SignInMethodState.Disabled,
        },
      };
      await expectPatchResponseStatus(signInExperience, 400);
    });
  });

  describe('email', () => {
    test.each(validSignInMethodStates)('%p should success', async (state) => {
      if (state === SignInMethodState.Primary) {
        return;
      }
      const signInExperience = {
        signInMethods: {
          username: SignInMethodState.Disabled,
          email: state,
          sms: SignInMethodState.Primary,
          social: SignInMethodState.Disabled,
        },
      };
      await expectPatchResponseStatus(signInExperience, 200);
    });

    test.each(invalidSignInMethodStates)('%p should fail', async (state) => {
      if (state === SignInMethodState.Primary) {
        return;
      }
      const signInExperience = {
        signInMethods: {
          username: SignInMethodState.Disabled,
          email: state,
          sms: SignInMethodState.Primary,
          social: SignInMethodState.Disabled,
        },
      };
      await expectPatchResponseStatus(signInExperience, 400);
    });
  });

  describe('sms', () => {
    test.each(validSignInMethodStates)('%p should success', async (state) => {
      if (state === SignInMethodState.Primary) {
        return;
      }
      const signInExperience = {
        signInMethods: {
          username: SignInMethodState.Disabled,
          email: SignInMethodState.Disabled,
          sms: state,
          social: SignInMethodState.Primary,
        },
        socialSignInConnectorTargets: ['github'],
      };
      await expectPatchResponseStatus(signInExperience, 200);
    });

    test.each(invalidSignInMethodStates)('%p should fail', async (state) => {
      if (state === SignInMethodState.Primary) {
        return;
      }
      const signInExperience = {
        signInMethods: {
          username: SignInMethodState.Disabled,
          email: SignInMethodState.Disabled,
          sms: state,
          social: SignInMethodState.Primary,
        },
        socialSignInConnectorTargets: ['github'],
      };
      await expectPatchResponseStatus(signInExperience, 400);
    });
  });

  describe('social', () => {
    test.each(validSignInMethodStates)('%p should success', async (state) => {
      if (state === SignInMethodState.Primary) {
        return;
      }
      const signInExperience = {
        signInMethods: {
          username: SignInMethodState.Primary,
          email: SignInMethodState.Disabled,
          sms: SignInMethodState.Disabled,
          social: state,
        },
        socialSignInConnectorTargets: ['github'],
      };
      await expectPatchResponseStatus(signInExperience, 200);
    });

    test.each(invalidSignInMethodStates)('%p should fail', async (state) => {
      if (state === SignInMethodState.Primary) {
        return;
      }
      const signInExperience = {
        signInMethods: {
          username: SignInMethodState.Primary,
          email: SignInMethodState.Disabled,
          sms: SignInMethodState.Disabled,
          social: state,
        },
        socialSignInConnectorTargets: ['github'],
      };
      await expectPatchResponseStatus(signInExperience, 400);
    });
  });
});

describe('socialSignInConnectorTargets', () => {
  test.each([[['facebook']], [['facebook', 'github']]])(
    '%p should success',
    async (socialSignInConnectorTargets) => {
      await expectPatchResponseStatus(
        {
          signInMethods: { ...mockSignInMethods, social: SignInMethodState.Secondary },
          socialSignInConnectorTargets,
        },
        200
      );
    }
  );
});
