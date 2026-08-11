/* eslint-disable max-lines */
import {
  MfaFactor,
  MfaPolicy,
  OrganizationRequiredMfaPolicy,
  SignInIdentifier,
  ConnectorType,
  defaultTenantId,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { assertEnv } from '@silverhand/essentials';
import { createInterceptorsPreset, createPool, sql, type DatabasePool } from '@silverhand/slonik';
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
import { devFeatureTest, generatePassword } from '#src/utils.js';

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

  describe('adaptive mfa', () => {
    beforeEach(async () => {
      await updateSignInExperience({
        mfa: {
          policy: MfaPolicy.PromptAtSignInAndSignUp,
          factors: [],
        },
        adaptiveMfa: {
          enabled: false,
        },
      });
    });

    it('should reject adaptive mfa enablement when mfa is disabled', async () => {
      await expectRejects(updateSignInExperience({ adaptiveMfa: { enabled: true } }), {
        code: 'sign_in_experiences.adaptive_mfa_requires_mfa',
        status: 422,
      });
    });

    it('should allow enabling adaptive mfa when mfa is already enabled', async () => {
      await updateSignInExperience({
        mfa: {
          policy: MfaPolicy.PromptAtSignInAndSignUp,
          factors: [MfaFactor.TOTP],
        },
      });

      const adaptiveMfa = { enabled: true };

      const signInExperience = await updateSignInExperience({
        adaptiveMfa,
        mfa: {
          policy: MfaPolicy.PromptAtSignInAndSignUpMandatory,
          factors: [MfaFactor.TOTP],
        },
      });
      expect(signInExperience.adaptiveMfa).toEqual(adaptiveMfa);
    });

    it('should allow enabling adaptive mfa with mfa in the same request', async () => {
      const adaptiveMfa = { enabled: true };
      const mfa = {
        policy: MfaPolicy.PromptAtSignInAndSignUpMandatory,
        factors: [MfaFactor.TOTP],
      };

      const signInExperience = await updateSignInExperience({ adaptiveMfa, mfa });

      expect(signInExperience.adaptiveMfa).toEqual(adaptiveMfa);
      expect(signInExperience.mfa).toMatchObject(mfa);
    });

    it('should allow disabling mfa when adaptive mfa is already enabled', async () => {
      await updateSignInExperience({
        adaptiveMfa: { enabled: true },
        mfa: {
          policy: MfaPolicy.PromptAtSignInAndSignUpMandatory,
          factors: [MfaFactor.TOTP],
        },
      });

      const signInExperience = await updateSignInExperience({
        mfa: {
          policy: MfaPolicy.PromptAtSignInAndSignUp,
          factors: [],
        },
      });

      expect(signInExperience.mfa.factors).toEqual([]);
      expect(signInExperience.adaptiveMfa).toEqual({ enabled: false });
    });

    it('should reject adaptive mfa when mfa policy is mandatory', async () => {
      await updateSignInExperience({
        mfa: {
          policy: MfaPolicy.Mandatory,
          factors: [MfaFactor.TOTP],
        },
      });

      await expectRejects(updateSignInExperience({ adaptiveMfa: { enabled: true } }), {
        code: 'sign_in_experiences.adaptive_mfa_requires_non_skippable_policy',
        status: 422,
      });
    });

    it('should reject adaptive mfa when mfa policy is optional prompt policy', async () => {
      await updateSignInExperience({
        mfa: {
          policy: MfaPolicy.PromptAtSignInAndSignUp,
          factors: [MfaFactor.TOTP],
        },
      });

      await expectRejects(updateSignInExperience({ adaptiveMfa: { enabled: true } }), {
        code: 'sign_in_experiences.adaptive_mfa_requires_non_skippable_policy',
        status: 422,
      });
    });

    it('should reject adaptive policy when adaptive mfa is disabled', async () => {
      await expectRejects(
        updateSignInExperience({
          adaptiveMfa: { enabled: false },
          mfa: {
            policy: MfaPolicy.PromptAtSignInAndSignUpMandatory,
            factors: [MfaFactor.TOTP],
          },
        }),
        {
          code: 'sign_in_experiences.non_adaptive_mfa_requires_skippable_policy',
          status: 422,
        }
      );
    });
  });

  devFeatureTest.describe('trusted device policy', () => {
    beforeEach(async () => {
      await updateSignInExperience({
        trustedDevice: { enabled: false, durationDays: 30 },
      });
    });

    afterAll(async () => {
      await updateSignInExperience({
        trustedDevice: { enabled: false, durationDays: 30 },
      });
    });

    it.each([1, 365])('should persist a valid %i-day policy', async (durationDays) => {
      const trustedDevice = { enabled: true, durationDays };

      const updated = await updateSignInExperience({ trustedDevice });
      const fetched = await getSignInExperience();

      expect(updated.trustedDevice).toEqual(trustedDevice);
      expect(fetched.trustedDevice).toEqual(trustedDevice);
    });

    it.each([0, 366, 1.5])('should reject invalid duration %s', async (durationDays) => {
      await expectRejects(
        updateSignInExperience({ trustedDevice: { enabled: true, durationDays } }),
        { code: 'guard.invalid_input', status: 400 }
      );
    });

    it('should reject a non-boolean enabled value', async () => {
      await expectRejects(
        updateSignInExperience({
          trustedDevice: {
            // @ts-expect-error -- Intentionally verify runtime API validation.
            enabled: 'true',
            durationDays: 30,
          },
        }),
        { code: 'guard.invalid_input', status: 400 }
      );
    });

    it.each([{}, { enabled: true }, { durationDays: 30 }])(
      'should reject incomplete policy %p',
      async (trustedDevice) => {
        await expectRejects(updateSignInExperience({ trustedDevice }), {
          code: 'guard.invalid_input',
          status: 400,
        });
      }
    );
  });
});

devFeatureTest.describe('trusted device global disable', () => {
  // eslint-disable-next-line @silverhand/fp/no-let -- Database pool lifecycle is managed by Jest hooks.
  let pool: DatabasePool;

  beforeAll(async () => {
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Initialize the shared test pool once.
    pool = await createPool(assertEnv('DB_URL'), {
      interceptors: createInterceptorsPreset(),
    });
  });

  afterAll(async () => {
    await updateSignInExperience({ trustedDevice: { enabled: false, durationDays: 30 } });
    await pool.end();
  });

  it('deletes every tenant trusted-device record when enabled changes to disabled', async () => {
    const user = await createUser({ name: 'trusted-device-policy-test' });
    const trustedDeviceId = generateStandardId();

    try {
      await updateSignInExperience({ trustedDevice: { enabled: true, durationDays: 30 } });
      await pool.query(sql`
        insert into trusted_devices (
          tenant_id,
          id,
          user_id,
          secret_hash,
          expires_at
        ) values (
          ${defaultTenantId},
          ${trustedDeviceId},
          ${user.id},
          ${sql.binary(Buffer.alloc(32, 1))},
          now() + interval '30 days'
        )
      `);

      await updateSignInExperience({ trustedDevice: { enabled: false, durationDays: 30 } });

      await expect(
        pool.oneFirst<number>(sql`
          select count(*)::integer
          from trusted_devices
          where tenant_id = ${defaultTenantId} and id = ${trustedDeviceId}
        `)
      ).resolves.toBe(0);
    } finally {
      await pool.query(sql`
        delete from trusted_devices
        where tenant_id = ${defaultTenantId} and id = ${trustedDeviceId}
      `);
      await deleteUser(user.id);
    }
  });

  it('does not delete trusted-device records when the policy remains disabled', async () => {
    const user = await createUser({ name: 'trusted-device-disabled-policy-test' });
    const trustedDeviceId = generateStandardId();

    try {
      await updateSignInExperience({ trustedDevice: { enabled: false, durationDays: 30 } });
      await pool.query(sql`
        insert into trusted_devices (
          tenant_id,
          id,
          user_id,
          secret_hash,
          expires_at
        ) values (
          ${defaultTenantId},
          ${trustedDeviceId},
          ${user.id},
          ${sql.binary(Buffer.alloc(32, 1))},
          now() + interval '30 days'
        )
      `);

      await updateSignInExperience({ trustedDevice: { enabled: false, durationDays: 60 } });

      await expect(
        pool.oneFirst<number>(sql`
          select count(*)::integer
          from trusted_devices
          where tenant_id = ${defaultTenantId} and id = ${trustedDeviceId}
        `)
      ).resolves.toBe(1);
    } finally {
      await pool.query(sql`
        delete from trusted_devices
        where tenant_id = ${defaultTenantId} and id = ${trustedDeviceId}
      `);
      await deleteUser(user.id);
    }
  });

  it('serializes policy writes and credential creation by tenant', async () => {
    await pool.transaction(async (firstConnection) => {
      await firstConnection.query(
        sql`select pg_advisory_xact_lock(hashtextextended(${defaultTenantId}, 0))`
      );

      await pool.transaction(async (secondConnection) => {
        await expect(
          secondConnection.oneFirst<boolean>(sql`
            select pg_try_advisory_xact_lock(hashtextextended(${defaultTenantId}, 0))
          `)
        ).resolves.toBe(false);
        await expect(
          secondConnection.oneFirst<boolean>(sql`
            select pg_try_advisory_xact_lock(
              hashtextextended(${`${defaultTenantId}-another-tenant`}, 0)
            )
          `)
        ).resolves.toBe(true);
      });
    });

    await pool.transaction(async (connection) => {
      await expect(
        connection.oneFirst<boolean>(sql`
          select pg_try_advisory_xact_lock(hashtextextended(${defaultTenantId}, 0))
        `)
      ).resolves.toBe(true);
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
/* eslint-enable max-lines */
