import {
  CreateSignInExperience,
  Language,
  SignInExperience,
  SignInMethodState,
} from '@logto/schemas';

import {
  mockAliyunDmConnectorInstance,
  mockAliyunSmsConnectorInstance,
  mockFacebookConnectorInstance,
  mockGithubConnectorInstance,
  mockGoogleConnectorInstance,
  mockLanguageInfo,
  mockSignInExperience,
  mockSignInMethods,
  mockTermsOfUse,
} from '@/utils/mock';
import { createRequester } from '@/utils/test-utils';

import signInExperiencesRoutes from './sign-in-experience';

jest.mock('@/connectors', () => ({
  getConnectorInstances: jest.fn(async () => [
    mockAliyunDmConnectorInstance,
    mockAliyunSmsConnectorInstance,
    mockFacebookConnectorInstance,
    mockGithubConnectorInstance,
    mockGoogleConnectorInstance,
  ]),
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

const expectPatchResponseStatus = async (signInExperience: any, status: number) => {
  const response = await signInExperienceRequester.patch('/sign-in-exp').send(signInExperience);
  expect(response.status).toEqual(status);
};

const validBooleans = [true, false];
const invalidBooleans = [undefined, null, 0, 1, '0', '1', 'true', 'false'];

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

describe('signInMethods', () => {
  const validSignInMethodStates = Object.values(SignInMethodState);
  const invalidSignInMethodStates = [undefined, null, '', ' \t\n\r', 'invalid'];

  describe('username', () => {
    test.each(validSignInMethodStates)('%p should success', async (state) => {
      if (state === SignInMethodState.primary) {
        return;
      }
      const signInExperience = {
        signInMethods: {
          username: state,
          email: SignInMethodState.primary,
          sms: SignInMethodState.disabled,
          social: SignInMethodState.disabled,
        },
      };
      await expectPatchResponseStatus(signInExperience, 200);
    });

    test.each(invalidSignInMethodStates)('%p should fail', async (state) => {
      if (state === SignInMethodState.primary) {
        return;
      }
      const signInExperience = {
        signInMethods: {
          username: state,
          email: SignInMethodState.primary,
          sms: SignInMethodState.disabled,
          social: SignInMethodState.disabled,
        },
      };
      await expectPatchResponseStatus(signInExperience, 400);
    });
  });

  describe('email', () => {
    test.each(validSignInMethodStates)('%p should success', async (state) => {
      if (state === SignInMethodState.primary) {
        return;
      }
      const signInExperience = {
        signInMethods: {
          username: SignInMethodState.disabled,
          email: state,
          sms: SignInMethodState.primary,
          social: SignInMethodState.disabled,
        },
      };
      await expectPatchResponseStatus(signInExperience, 200);
    });

    test.each(invalidSignInMethodStates)('%p should fail', async (state) => {
      if (state === SignInMethodState.primary) {
        return;
      }
      const signInExperience = {
        signInMethods: {
          username: SignInMethodState.disabled,
          email: state,
          sms: SignInMethodState.primary,
          social: SignInMethodState.disabled,
        },
      };
      await expectPatchResponseStatus(signInExperience, 400);
    });
  });

  describe('sms', () => {
    test.each(validSignInMethodStates)('%p should success', async (state) => {
      if (state === SignInMethodState.primary) {
        return;
      }
      const signInExperience = {
        signInMethods: {
          username: SignInMethodState.disabled,
          email: SignInMethodState.disabled,
          sms: state,
          social: SignInMethodState.primary,
        },
        socialSignInConnectorIds: ['github'],
      };
      await expectPatchResponseStatus(signInExperience, 200);
    });

    test.each(invalidSignInMethodStates)('%p should fail', async (state) => {
      if (state === SignInMethodState.primary) {
        return;
      }
      const signInExperience = {
        signInMethods: {
          username: SignInMethodState.disabled,
          email: SignInMethodState.disabled,
          sms: state,
          social: SignInMethodState.primary,
        },
        socialSignInConnectorIds: ['github'],
      };
      await expectPatchResponseStatus(signInExperience, 400);
    });
  });

  describe('social', () => {
    test.each(validSignInMethodStates)('%p should success', async (state) => {
      if (state === SignInMethodState.primary) {
        return;
      }
      const signInExperience = {
        signInMethods: {
          username: SignInMethodState.primary,
          email: SignInMethodState.disabled,
          sms: SignInMethodState.disabled,
          social: state,
        },
        socialSignInConnectorIds: ['github'],
      };
      await expectPatchResponseStatus(signInExperience, 200);
    });

    test.each(invalidSignInMethodStates)('%p should fail', async (state) => {
      if (state === SignInMethodState.primary) {
        return;
      }
      const signInExperience = {
        signInMethods: {
          username: SignInMethodState.primary,
          email: SignInMethodState.disabled,
          sms: SignInMethodState.disabled,
          social: state,
        },
        socialSignInConnectorIds: ['github'],
      };
      await expectPatchResponseStatus(signInExperience, 400);
    });
  });
});

describe('socialSignInConnectorIds', () => {
  test.each([[['facebook']], [['facebook', 'github']]])(
    '%p should success',
    async (socialSignInConnectorIds) => {
      await expectPatchResponseStatus(
        {
          signInMethods: { ...mockSignInMethods, social: SignInMethodState.secondary },
          socialSignInConnectorIds,
        },
        200
      );
    }
  );

  test.each([[[]], [[null, undefined]], [['', ' \t\n\r']], [[123, 456]]])(
    '%p should fail',
    async (socialSignInConnectorIds: any[]) => {
      await expectPatchResponseStatus(
        {
          signInMethods: { ...mockSignInMethods, social: SignInMethodState.secondary },
          socialSignInConnectorIds,
        },
        400
      );
    }
  );
});
