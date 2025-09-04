import { UserScope } from '@logto/core-kit';
import { MfaFactor, MfaPolicy } from '@logto/schemas';

import { enableAllAccountCenterFields } from '#src/api/account-center.js';
import { createUserMfaVerification } from '#src/api/admin-user.js';
import { updateSignInExperience } from '#src/api/index.js';
import { updateMfaSettings } from '#src/api/my-account.js';
import { createVerificationRecordByPassword } from '#src/api/verification-record.js';
import { initExperienceClient } from '#src/helpers/client.js';
import { identifyUserWithUsernamePassword } from '#src/helpers/experience/index.js';
import {
  signInAndGetUserApi,
  createDefaultTenantUserWithPassword,
  deleteDefaultTenantUser,
} from '#src/helpers/profile.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { UserApiTest } from '#src/helpers/user.js';

describe('skipMfaOnSignIn user setting', () => {
  const userApi = new UserApiTest();

  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await enableAllAccountCenterFields();
  });

  beforeEach(async () => {
    // Reset MFA policy for test isolation
    await updateSignInExperience({
      mfa: {
        factors: [MfaFactor.TOTP],
        policy: MfaPolicy.NoPrompt, // Non-mandatory policy
      },
    });
  });

  afterAll(async () => {
    await userApi.cleanUp();
  });

  describe('MFA bypass functionality', () => {
    it('should bypass MFA when skipMfaOnSignIn is true', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });

      // Enable MFA skip for this user
      const verificationRecordId = await createVerificationRecordByPassword(api, password);
      await updateMfaSettings(api, verificationRecordId, true);

      // Set up MFA factor (should be bypassed)
      await createUserMfaVerification(user.id, MfaFactor.TOTP);

      const client = await initExperienceClient();
      await identifyUserWithUsernamePassword(client, username, password);

      // Should complete sign-in without MFA verification
      await expect(client.submitInteraction()).resolves.not.toThrow();

      await deleteDefaultTenantUser(user.id);
    });
  });

  describe('Mandatory MFA policy override', () => {
    it('should ignore user setting when MFA policy is Mandatory', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();

      // First, set up MFA factor and disable MFA requirement using the user API
      // (before setting Mandatory policy which would prevent sign-in)
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });
      const verificationRecordId = await createVerificationRecordByPassword(api, password);
      await updateMfaSettings(api, verificationRecordId, false);
      await createUserMfaVerification(user.id, MfaFactor.TOTP);

      // Now set MFA policy to Mandatory (this should override the user setting)
      await updateSignInExperience({
        mfa: {
          factors: [MfaFactor.TOTP],
          policy: MfaPolicy.Mandatory,
        },
      });

      const client = await initExperienceClient();
      await identifyUserWithUsernamePassword(client, username, password);

      // Should still require MFA due to Mandatory policy (ignoring user's skipMfaOnSignIn = true)
      await expect(client.submitInteraction()).rejects.toThrow();

      await deleteDefaultTenantUser(user.id);
    });
  });
});
