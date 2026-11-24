import { UserScope } from '@logto/core-kit';
import { MfaFactor, MfaPolicy, MfaVerificationCodeEnrollment } from '@logto/schemas';

import { enableAllAccountCenterFields } from '#src/api/account-center.js';
import { getUserLogtoConfig } from '#src/api/admin-user.js';
import { updateSignInExperience } from '#src/api/index.js';
import {
  addMfaVerification,
  deleteMfaVerification,
  getMfaVerifications,
} from '#src/api/my-account.js';
import { createVerificationRecordByPassword } from '#src/api/verification-record.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  createDefaultTenantUserWithPassword,
  deleteDefaultTenantUser,
  signInAndGetUserApi,
} from '#src/helpers/profile.js';
import {
  enableAllPasswordSignInMethods,
  resetMfaSettings,
} from '#src/helpers/sign-in-experience.js';
import { devFeatureTest, generateEmail, generatePhone } from '#src/utils.js';

const factorConfigs = [
  {
    type: MfaFactor.EmailVerificationCode,
    profile: () => ({ primaryEmail: generateEmail() }),
    missingIdentifierCode: 'user.email_not_exist',
  },
  {
    type: MfaFactor.PhoneVerificationCode,
    profile: () => ({ primaryPhone: generatePhone() }),
    missingIdentifierCode: 'user.phone_not_exist',
  },
] as const;

const signIn = async (profile: { primaryEmail?: string; primaryPhone?: string } = {}) => {
  const { user, username, password } = await createDefaultTenantUserWithPassword(profile);
  const api = await signInAndGetUserApi(username, password, {
    scopes: [UserScope.Profile, UserScope.Identities],
  });

  return { user, password, api };
};

devFeatureTest.describe('my-account (mfa - email and phone verification codes)', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await enableAllAccountCenterFields();
    // Explicit enrollment keeps the password sign-in free of an MFA challenge for users who have a
    // primary email or phone but no record yet.
    await updateSignInExperience({
      mfa: {
        factors: [MfaFactor.EmailVerificationCode, MfaFactor.PhoneVerificationCode],
        policy: MfaPolicy.NoPrompt,
        verificationCodeEnrollment: MfaVerificationCodeEnrollment.Explicit,
      },
    });
  });

  afterAll(async () => {
    await resetMfaSettings();
  });

  describe.each(factorConfigs)('$type', ({ type, profile, missingIdentifierCode }) => {
    it('should enroll the primary identifier, enable MFA, and remove the record', async () => {
      const { user, password, api } = await signIn(profile());
      const { mfa: mfaBefore } = await getUserLogtoConfig(user.id);
      expect(mfaBefore.enabled).not.toBe(true);

      await addMfaVerification(api, await createVerificationRecordByPassword(api, password), {
        type,
      });

      const mfaVerifications = await getMfaVerifications(api);
      expect(mfaVerifications).toHaveLength(1);
      expect(mfaVerifications[0]).toMatchObject({ type });
      const { mfa: mfaAfter } = await getUserLogtoConfig(user.id);
      expect(mfaAfter.enabled).toBe(true);

      await deleteMfaVerification(
        api,
        mfaVerifications[0]!.id,
        await createVerificationRecordByPassword(api, password)
      );
      expect(await getMfaVerifications(api)).toEqual([]);

      await deleteDefaultTenantUser(user.id);
    });

    it('should reject enrollment without the primary identifier', async () => {
      const { user, password, api } = await signIn();

      await expectRejects(
        addMfaVerification(api, await createVerificationRecordByPassword(api, password), {
          type,
        }),
        { code: missingIdentifierCode, status: 422 }
      );
      expect(await getMfaVerifications(api)).toEqual([]);

      await deleteDefaultTenantUser(user.id);
    });

    it('should reject enrolling the same factor twice', async () => {
      const { user, password, api } = await signIn(profile());

      await addMfaVerification(api, await createVerificationRecordByPassword(api, password), {
        type,
      });
      await expectRejects(
        addMfaVerification(api, await createVerificationRecordByPassword(api, password), {
          type,
        }),
        { code: 'session.mfa.bind_mfa_existed', status: 422 }
      );
      expect(await getMfaVerifications(api)).toHaveLength(1);

      await deleteDefaultTenantUser(user.id);
    });
  });
});
