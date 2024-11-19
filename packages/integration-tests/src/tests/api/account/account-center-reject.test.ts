import { UserScope } from '@logto/core-kit';
import { AccountCenterControlValue } from '@logto/schemas';

import { mockSocialConnectorTarget } from '#src/__mocks__/connectors-mock.js';
import { updateAccountCenter } from '#src/api/account-center.js';
import {
  deleteIdentity,
  getUserInfo,
  updateIdentities,
  updateOtherProfile,
  updatePassword,
  updatePrimaryEmail,
  updatePrimaryPhone,
  updateUser,
} from '#src/api/my-account.js';
import { createVerificationRecordByPassword } from '#src/api/verification-record.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  createDefaultTenantUserWithPassword,
  deleteDefaultTenantUser,
  signInAndGetUserApi,
} from '#src/helpers/profile.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateEmail, generatePhone } from '#src/utils.js';

const expectedError = {
  code: 'account_center.filed_not_editable',
  status: 400,
};

describe('account center fields disabled', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await updateAccountCenter({
      enabled: true,
      fields: {
        name: AccountCenterControlValue.ReadOnly,
        // Unexisted field should not be readable
      },
    });
  });

  it('should return only name in GET /my-account', async () => {
    const { user, username, password } = await createDefaultTenantUserWithPassword();
    const api = await signInAndGetUserApi(username, password, {
      scopes: [UserScope.Email],
    });

    const response = await getUserInfo(api);
    expect(response).toMatchObject({ name: null });
    expect(response).not.toHaveProperty('avatar');
    expect(response).not.toHaveProperty('username');
    expect(response).not.toHaveProperty('primaryEmail');
    expect(response).not.toHaveProperty('primaryPhone');
    expect(response).not.toHaveProperty('identities');
    expect(response).not.toHaveProperty('profile');

    await deleteDefaultTenantUser(user.id);
  });

  it('should fail for each API', async () => {
    const { user, username, password } = await createDefaultTenantUserWithPassword();
    const api = await signInAndGetUserApi(username, password);

    await expectRejects(updateUser(api, { name: 'name' }), {
      code: 'account_center.filed_not_editable',
      status: 400,
    });
    await expectRejects(updateUser(api, { avatar: 'https://example.com/avatar.png' }), {
      code: 'account_center.filed_not_editable',
      status: 400,
    });
    await expectRejects(updateUser(api, { username: 'username' }), {
      code: 'account_center.filed_not_editable',
      status: 400,
    });

    await expectRejects(updateOtherProfile(api, { profile: 'profile' }), {
      code: 'account_center.filed_not_editable',
      status: 400,
    });

    const verificationRecordId = await createVerificationRecordByPassword(api, password);
    await expectRejects(updatePassword(api, verificationRecordId, 'new-password'), {
      code: 'account_center.filed_not_editable',
      status: 400,
    });

    await expectRejects(
      updatePrimaryEmail(api, generateEmail(), verificationRecordId, 'new-verification-record-id'),
      expectedError
    );

    await expectRejects(
      updatePrimaryPhone(api, generatePhone(), verificationRecordId, 'new-verification-record-id'),
      expectedError
    );

    await expectRejects(
      updateIdentities(api, verificationRecordId, 'new-verification-record-id'),
      expectedError
    );

    await expectRejects(
      deleteIdentity(api, mockSocialConnectorTarget, verificationRecordId),
      expectedError
    );

    await deleteDefaultTenantUser(user.id);
  });
});
