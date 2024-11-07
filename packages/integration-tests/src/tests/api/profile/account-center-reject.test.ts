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
} from '#src/api/profile.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  createDefaultTenantUserWithPassword,
  deleteDefaultTenantUser,
  signInAndGetUserApi,
} from '#src/helpers/profile.js';
import { devFeatureTest, generateEmail, generatePhone } from '#src/utils.js';

const { describe, it } = devFeatureTest;

const expectedError = {
  code: 'account_center.filed_not_editable',
  status: 400,
};

describe('profile, account center fields disabled', () => {
  beforeAll(async () => {
    await updateAccountCenter({
      enabled: true,
      fields: {
        name: AccountCenterControlValue.ReadOnly,
        // Unexisted filed should not be readable
      },
    });
  });

  it('should return only name in GET /profile', async () => {
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

    await expectRejects(updatePassword(api, 'verification-record-id', 'new-password'), {
      code: 'account_center.filed_not_editable',
      status: 400,
    });

    await expectRejects(
      updatePrimaryEmail(
        api,
        generateEmail(),
        'verification-record-id',
        'new-verification-record-id'
      ),
      expectedError
    );

    await expectRejects(
      updatePrimaryPhone(
        api,
        generatePhone(),
        'verification-record-id',
        'new-verification-record-id'
      ),
      expectedError
    );

    await expectRejects(
      updateIdentities(api, 'verification-record-id', 'new-verification-record-id'),
      expectedError
    );

    await expectRejects(
      deleteIdentity(api, mockSocialConnectorTarget, 'verification-record-id'),
      expectedError
    );

    await deleteDefaultTenantUser(user.id);
  });
});
