import {
  MfaFactor,
  MfaPolicy,
  OrganizationRequiredMfaPolicy,
  SignInIdentifier,
  ConnectorType,
} from '@logto/schemas';
import { HTTPError, type ResponsePromise } from 'ky';

import {
  authedAdminApi,
  createUser,
  deleteUser,
  getSignInExperience,
  updateSignInExperience,
} from '#src/api/index.js';
import {
  clearConnectorsByTypes,
  setEmailConnector,
  setSmsConnector,
} from '#src/helpers/connector.js';
import { expectRejects } from '#src/helpers/index.js';
import { defaultSignInSignUpConfigs } from '#src/helpers/sign-in-experience.js';
import { generatePassword } from '#src/utils.js';

describe('admin console sign-in experience', () => {
  afterAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
  });

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
        policy: MfaPolicy.PromptAtSignInAndSignUp,
        factors: [],
        organizationRequiredMfaPolicy: OrganizationRequiredMfaPolicy.Mandatory,
      },
      singleSignOnEnabled: true,
      supportEmail: 'contact@logto.io',
      supportWebsiteUrl: 'https://logto.io',
      forgotPasswordMethods: [],
    };

    const updatedSignInExperience = await updateSignInExperience(newSignInExperience);
    expect(updatedSignInExperience).toMatchObject(newSignInExperience);
  });

  it('throw 400 when fail to validate SIE', async () => {
    const newSignInExperience = {
      signUp: {
        identifiers: [SignInIdentifier.Email],
        password: false,
        verify: false,
      },
    };

    await setEmailConnector();
    await expectRejects(updateSignInExperience(newSignInExperience), {
      code: 'sign_in_experiences.passwordless_requires_verify',
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

    await deleteUser(user.id);
  });
});

describe('MFA validation', () => {
  beforeEach(async () => {
    await Promise.all([setEmailConnector(), setSmsConnector()]);
    // Clear sign in experience before each test
    await updateSignInExperience({
      ...defaultSignInSignUpConfigs,
      mfa: {
        policy: MfaPolicy.NoPrompt,
        factors: [],
      },
    });
  });

  afterEach(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
  });

  it('should reject email verification code MFA when email verification is used for sign-in', async () => {
    await updateSignInExperience({
      signIn: {
        methods: [
          {
            identifier: SignInIdentifier.Email,
            password: false,
            verificationCode: true,
            isPasswordPrimary: false,
          },
        ],
      },
    });

    await expectRejects(
      updateSignInExperience({
        mfa: {
          policy: MfaPolicy.Mandatory,
          factors: [MfaFactor.EmailVerificationCode, MfaFactor.TOTP],
        },
      }),
      {
        code: 'sign_in_experiences.email_verification_code_cannot_be_used_for_mfa',
        status: 400,
      }
    );
  });

  it('should reject phone verification code MFA when phone verification is used for sign-in', async () => {
    await updateSignInExperience({
      signIn: {
        methods: [
          {
            identifier: SignInIdentifier.Phone,
            password: false,
            verificationCode: true,
            isPasswordPrimary: false,
          },
        ],
      },
    });

    await expectRejects(
      updateSignInExperience({
        mfa: {
          policy: MfaPolicy.Mandatory,
          factors: [MfaFactor.PhoneVerificationCode, MfaFactor.BackupCode],
        },
      }),
      {
        code: 'sign_in_experiences.phone_verification_code_cannot_be_used_for_mfa',
        status: 400,
      }
    );
  });

  it('should allow email verification code MFA when email is used with password for sign-in', async () => {
    await updateSignInExperience({
      signIn: {
        methods: [
          {
            identifier: SignInIdentifier.Email,
            password: true,
            verificationCode: false,
            isPasswordPrimary: true,
          },
        ],
      },
    });

    const result = await updateSignInExperience({
      mfa: {
        policy: MfaPolicy.Mandatory,
        factors: [MfaFactor.EmailVerificationCode, MfaFactor.TOTP],
      },
    });

    expect(result.mfa.factors).toContain(MfaFactor.EmailVerificationCode);
    expect(result.mfa.factors).toContain(MfaFactor.TOTP);
  });

  it('should allow phone verification code MFA when phone is used with password for sign-in', async () => {
    await updateSignInExperience({
      signIn: {
        methods: [
          {
            identifier: SignInIdentifier.Phone,
            password: true,
            verificationCode: false,
            isPasswordPrimary: true,
          },
        ],
      },
    });

    const result = await updateSignInExperience({
      mfa: {
        policy: MfaPolicy.Mandatory,
        factors: [MfaFactor.PhoneVerificationCode, MfaFactor.TOTP],
      },
    });

    expect(result.mfa.factors).toContain(MfaFactor.PhoneVerificationCode);
    expect(result.mfa.factors).toContain(MfaFactor.TOTP);
  });

  it('should reject email verification code sign-in when email MFA is enabled', async () => {
    await updateSignInExperience({
      mfa: {
        policy: MfaPolicy.NoPrompt,
        factors: [MfaFactor.EmailVerificationCode, MfaFactor.TOTP],
      },
    });

    await expectRejects(
      updateSignInExperience({
        signIn: {
          methods: [
            {
              identifier: SignInIdentifier.Email,
              password: false,
              verificationCode: true,
              isPasswordPrimary: false,
            },
          ],
        },
      }),
      {
        code: 'sign_in_experiences.email_verification_code_cannot_be_used_for_sign_in',
        status: 400,
      }
    );
  });

  it('should reject phone verification code sign-in when phone MFA is enabled', async () => {
    await updateSignInExperience({
      mfa: {
        policy: MfaPolicy.NoPrompt,
        factors: [MfaFactor.PhoneVerificationCode, MfaFactor.BackupCode],
      },
    });

    await expectRejects(
      updateSignInExperience({
        signIn: {
          methods: [
            {
              identifier: SignInIdentifier.Phone,
              password: false,
              verificationCode: true,
              isPasswordPrimary: false,
            },
          ],
        },
      }),
      {
        code: 'sign_in_experiences.phone_verification_code_cannot_be_used_for_sign_in',
        status: 400,
      }
    );
  });
});
