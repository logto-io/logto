import { defaultUsernamePolicy } from '@logto/core-kit';

import { enableAllAccountCenterFields } from '#src/api/account-center.js';
import { deleteUser, updateSignInExperience } from '#src/api/index.js';
import { updateUser } from '#src/api/my-account.js';
import { createVerificationRecordByPassword } from '#src/api/verification-record.js';
import { expectRejects } from '#src/helpers/index.js';
import { createDefaultTenantUserWithPassword, signInAndGetUserApi } from '#src/helpers/profile.js';
import {
  defaultSignInSignUpConfigs,
  enableAllPasswordSignInMethods,
} from '#src/helpers/sign-in-experience.js';
import { devFeatureTest, generateUsername } from '#src/utils.js';

const uppercaseUsername = () => `A${generateUsername()}`;

const uppercaseDisabledPolicy = {
  ...defaultUsernamePolicy,
  allowedChars: { lowercase: true, uppercase: false, numbers: true, underscore: true },
};

// Dev-gated: policy enforcement only activates under dev features.
devFeatureTest.describe('account API username policy enforcement', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await enableAllAccountCenterFields();
    await updateSignInExperience({ usernamePolicy: uppercaseDisabledPolicy });
  });

  afterAll(async () => {
    await updateSignInExperience({
      ...defaultSignInSignUpConfigs,
      usernamePolicy: defaultUsernamePolicy,
    });
  });

  it('rejects updating to a username that violates the policy', async () => {
    const { user, username, password } = await createDefaultTenantUserWithPassword();
    const api = await signInAndGetUserApi(username, password);
    const verificationRecordId = await createVerificationRecordByPassword(api, password);

    await expectRejects(updateUser(api, { username: uppercaseUsername() }, verificationRecordId), {
      code: 'user.username_uppercase_not_allowed',
      status: 422,
    });

    await deleteUser(user.id);
  });
});
