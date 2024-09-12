import { updatePassword } from '#src/api/profile.js';
import { createVerificationRecordByPassword } from '#src/api/verification-record.js';
import {
  createUserWithPassword,
  deleteUser,
  initClientAndSignIn,
  signInAndGetProfileApi,
} from '#src/helpers/admin-tenant.js';
import { expectRejects } from '#src/helpers/index.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { devFeatureTest, generatePassword } from '#src/utils.js';

const { describe, it } = devFeatureTest;

describe('profile', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
  });

  describe('POST /profile/password', () => {
    it('should fail if verification record is invalid', async () => {
      const { user, username, password } = await createUserWithPassword();
      const api = await signInAndGetProfileApi(username, password);
      const newPassword = generatePassword();

      await expectRejects(updatePassword(api, 'invalid-varification-record-id', newPassword), {
        code: 'verification_record.not_found',
        status: 400,
      });

      await deleteUser(user.id);
    });

    it('should be able to update password', async () => {
      const { user, username, password } = await createUserWithPassword();
      const api = await signInAndGetProfileApi(username, password);
      const verificationRecordId = await createVerificationRecordByPassword(api, password);
      const newPassword = generatePassword();

      await updatePassword(api, verificationRecordId, newPassword);

      // Sign in with new password
      await initClientAndSignIn(username, newPassword);

      await deleteUser(user.id);
    });
  });
});
