import { defaultUsernamePolicy } from '@logto/core-kit';

import { enableAllAccountCenterFields } from '#src/api/account-center.js';
import { deleteUser, updateSignInExperience } from '#src/api/index.js';
import { updateUser } from '#src/api/my-account.js';
import { createVerificationRecordByPassword } from '#src/api/verification-record.js';
import { createUserByAdmin, expectRejects } from '#src/helpers/index.js';
import { createDefaultTenantUserWithPassword, signInAndGetUserApi } from '#src/helpers/profile.js';
import {
  defaultSignInSignUpConfigs,
  enableAllPasswordSignInMethods,
} from '#src/helpers/sign-in-experience.js';
import { devFeatureTest, generateUsername } from '#src/utils.js';

// Restore a known baseline so this suite does not leak its sign-in or username-policy changes.
const resetSignInExperience = async () =>
  updateSignInExperience({ ...defaultSignInSignUpConfigs, usernamePolicy: defaultUsernamePolicy });

describe('account API username case sensitivity', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await enableAllAccountCenterFields();
  });

  afterAll(async () => {
    await resetSignInExperience();
  });

  it('should allow updating to a username that differs only by case from another user', async () => {
    const base = generateUsername();
    const other = await createUserByAdmin({ username: base.toLowerCase() });
    const { user, username, password } = await createDefaultTenantUserWithPassword();
    const api = await signInAndGetUserApi(username, password);
    const verificationRecordId = await createVerificationRecordByPassword(api, password);

    const response = await updateUser(api, { username: base.toUpperCase() }, verificationRecordId);

    expect(response).toMatchObject({ username: base.toUpperCase() });
    await deleteUser(other.id);
    await deleteUser(user.id);
  });
});

// Gated to dev features: the sign-in experience write path drops `usernamePolicy` unless dev
// features are enabled, so case-insensitivity can only be configured (and exercised) here.
devFeatureTest.describe('account API username case sensitivity (case-insensitive policy)', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await enableAllAccountCenterFields();
    await updateSignInExperience({
      usernamePolicy: { ...defaultUsernamePolicy, caseSensitive: false },
    });
  });

  afterAll(async () => {
    await resetSignInExperience();
  });

  it('should reject updating to a username that differs only by case from another user', async () => {
    const base = generateUsername();
    const other = await createUserByAdmin({ username: base.toLowerCase() });
    const { user, username, password } = await createDefaultTenantUserWithPassword();
    const api = await signInAndGetUserApi(username, password);
    const verificationRecordId = await createVerificationRecordByPassword(api, password);

    await expectRejects(updateUser(api, { username: base.toUpperCase() }, verificationRecordId), {
      code: 'user.username_already_in_use',
      status: 422,
    });

    await deleteUser(other.id);
    await deleteUser(user.id);
  });
});
