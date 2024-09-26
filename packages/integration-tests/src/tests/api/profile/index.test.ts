import { getUserInfo, updatePassword, updateUser } from '#src/api/profile.js';
import { createVerificationRecordByPassword } from '#src/api/verification-record.js';
import {
  createUserWithPassword,
  deleteUser,
  initClientAndSignIn,
} from '#src/helpers/admin-tenant.js';
import { expectRejects } from '#src/helpers/index.js';
import { signInAndGetUserApi } from '#src/helpers/profile.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { devFeatureTest, generatePassword, generateUsername } from '#src/utils.js';

const { describe, it } = devFeatureTest;

describe('profile', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
  });

  describe('PATCH /profile', () => {
    it('should be able to update name', async () => {
      const { user, username, password } = await createUserWithPassword();
      const api = await signInAndGetUserApi(username, password);
      const newName = generateUsername();

      const response = await updateUser(api, { name: newName });
      expect(response).toMatchObject({ name: newName });

      const userInfo = await getUserInfo(api);
      expect(userInfo).toHaveProperty('name', newName);

      await deleteUser(user.id);
    });

    it('should be able to update picture', async () => {
      const { user, username, password } = await createUserWithPassword();
      const api = await signInAndGetUserApi(username, password);
      const newAvatar = 'https://example.com/avatar.png';

      const response = await updateUser(api, { avatar: newAvatar });
      expect(response).toMatchObject({ avatar: newAvatar });

      const userInfo = await getUserInfo(api);
      // In OIDC, the avatar is mapped to the `picture` field
      expect(userInfo).toHaveProperty('picture', newAvatar);

      await deleteUser(user.id);
    });

    it('should be able to update username', async () => {
      const { user, username, password } = await createUserWithPassword();
      const api = await signInAndGetUserApi(username, password);
      const newUsername = generateUsername();

      const response = await updateUser(api, { username: newUsername });
      expect(response).toMatchObject({ username: newUsername });

      // Sign in with new username
      await initClientAndSignIn(newUsername, password);

      await deleteUser(user.id);
    });

    it('should fail if username is already in use', async () => {
      const { user, username, password } = await createUserWithPassword();
      const { user: user2, username: username2 } = await createUserWithPassword();
      const api = await signInAndGetUserApi(username, password);

      await expectRejects(updateUser(api, { username: username2 }), {
        code: 'user.username_already_in_use',
        status: 422,
      });

      await deleteUser(user.id);
      await deleteUser(user2.id);
    });
  });

  describe('POST /profile/password', () => {
    it('should fail if verification record is invalid', async () => {
      const { user, username, password } = await createUserWithPassword();
      const api = await signInAndGetUserApi(username, password);
      const newPassword = generatePassword();

      await expectRejects(updatePassword(api, 'invalid-varification-record-id', newPassword), {
        code: 'verification_record.not_found',
        status: 400,
      });

      await deleteUser(user.id);
    });

    it('should be able to update password', async () => {
      const { user, username, password } = await createUserWithPassword();
      const api = await signInAndGetUserApi(username, password);
      const verificationRecordId = await createVerificationRecordByPassword(api, password);
      const newPassword = generatePassword();

      await updatePassword(api, verificationRecordId, newPassword);

      // Sign in with new password
      await initClientAndSignIn(username, newPassword);

      await deleteUser(user.id);
    });
  });
});
