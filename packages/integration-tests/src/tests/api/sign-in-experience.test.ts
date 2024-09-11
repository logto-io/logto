import { MfaPolicy, SignInIdentifier } from '@logto/schemas';
import { HTTPError, type ResponsePromise } from 'ky';

import {
  authedAdminApi,
  createUser,
  deleteUser,
  getSignInExperience,
  updateSignInExperience,
} from '#src/api/index.js';
import { expectRejects } from '#src/helpers/index.js';
import { generatePassword } from '#src/utils.js';

describe('admin console sign-in experience', () => {
  it('should get sign-in experience successfully', async () => {
    const signInExperience = await getSignInExperience();

    expect(signInExperience).toBeTruthy();
  });

  it('should update sign-in experience successfully', async () => {
    const newSignInExperience = {
      color: {
        primaryColor: '#ffffff',
        darkPrimaryColor: '#000000',
        isDarkModeEnabled: true,
      },
      branding: {
        logoUrl: 'mock://fake-url/logo.png',
        darkLogoUrl: 'mock://fake-url/dark-logo.png',
      },
      termsOfUseUrl: 'mock://fake-url/terms',
      privacyPolicyUrl: 'mock://fake-url/privacy',
      mfa: {
        policy: MfaPolicy.UserControlled,
        factors: [],
      },
      singleSignOnEnabled: true,
    };

    const updatedSignInExperience = await updateSignInExperience(newSignInExperience);
    expect(updatedSignInExperience).toMatchObject(newSignInExperience);
  });

  it('throw 400 when fail to validate SIE', async () => {
    const newSignInExperience = {
      signUp: {
        identifiers: [SignInIdentifier.Username],
        password: false,
        verify: false,
      },
    };

    await expectRejects(updateSignInExperience(newSignInExperience), {
      code: 'sign_in_experiences.username_requires_password',
      status: 400,
    });
  });
});

const expectPasswordIssues = async (promise: ResponsePromise, issueCodes: string[]) => {
  try {
    await promise;
    fail('Should have thrown');
  } catch (error) {
    if (!(error instanceof HTTPError)) {
      throw error;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body: { result: false; issues: Array<{ code: string }> } = await error.response.json();
    expect(body.result).toEqual(false);
    expect(body.issues.map((issue: { code: string }) => issue.code)).toEqual(issueCodes);
  }
};

describe('password policy', () => {
  beforeAll(async () => {
    await updateSignInExperience({
      passwordPolicy: {
        length: { min: 8, max: 64 },
        characterTypes: { min: 3 },
        rejects: {
          pwned: true,
          repetitionAndSequence: true,
          userInfo: true,
        },
      },
    });
  });

  it('should throw if rejects user info is enabled but no user id is provided', async () => {
    try {
      await authedAdminApi.post('sign-in-exp/default/check-password', {
        json: {
          password: 'johnny13',
        },
      });
      fail('Should have thrown');
    } catch (error) {
      if (!(error instanceof HTTPError)) {
        throw error;
      }

      const body: unknown = await error.response.json();

      console.log(body);
      expect(body).toMatchObject({
        code: 'request.invalid_input',
        data: {
          message: 'User information data is required to check user information.',
        },
      });
    }
  });

  it('should throw 400 for weak passwords', async () => {
    const user = await createUser({ name: 'Johnny' });
    await Promise.all([
      expectPasswordIssues(
        authedAdminApi.post('sign-in-exp/default/check-password', {
          json: {
            password: '123',
            userId: user.id,
          },
        }),
        [
          'password_rejected.too_short',
          'password_rejected.character_types',
          'password_rejected.restricted.sequence',
        ]
      ),
      expectPasswordIssues(
        authedAdminApi.post('sign-in-exp/default/check-password', {
          json: {
            password: 'johnny13',
            userId: user.id,
          },
        }),
        ['password_rejected.character_types', 'password_rejected.restricted.user_info']
      ),
      expectPasswordIssues(
        authedAdminApi.post('sign-in-exp/default/check-password', {
          json: {
            password: '123456aA',
            userId: user.id,
          },
        }),
        ['password_rejected.pwned', 'password_rejected.restricted.sequence']
      ),
    ]);

    await deleteUser(user.id);
  });

  it('should accept strong password', async () => {
    const user = await createUser({ name: 'Johnny' });

    await expect(
      authedAdminApi
        .post('sign-in-exp/default/check-password', {
          json: {
            password: generatePassword(),
            userId: user.id,
          },
        })
        .json()
    ).resolves.toHaveProperty('result', true);
  });
});
