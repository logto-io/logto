import { UserScope } from '@logto/core-kit';

import { enableAllAccountCenterFields } from '#src/api/account-center.js';
import { authedAdminApi, baseApi } from '#src/api/api.js';
import { deleteApplication } from '#src/api/application.js';
import { getUserInfo, updatePassword, updateUser } from '#src/api/my-account.js';
import { createVerificationRecordByPassword } from '#src/api/verification-record.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  createDefaultTenantUserWithPassword,
  deleteDefaultTenantUser,
} from '#src/helpers/profile.js';
import { createAppAndSignInWithPassword } from '#src/helpers/session.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateName, generatePassword } from '#src/utils.js';

const buildAccountApi = async (isThirdParty: boolean, username: string, password: string) => {
  const { app, client } = await createAppAndSignInWithPassword({
    username,
    password,
    isThirdParty,
    scopes: [UserScope.Profile],
  });

  const accessToken = await client.getAccessToken();

  return {
    app,
    api: baseApi.extend({ headers: { Authorization: `Bearer ${accessToken}` } }),
  };
};

describe('account API third-party guard', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await enableAllAccountCenterFields(authedAdminApi);
  });

  it('should reject account mutations from a third-party application', async () => {
    const { user, username, password } = await createDefaultTenantUserWithPassword();
    const { app, api } = await buildAccountApi(true, username, password);

    try {
      await expectRejects(updateUser(api, { name: generateName() }), {
        code: 'auth.third_party_application_forbidden',
        status: 403,
      });

      await expectRejects(updatePassword(api, undefined, generatePassword()), {
        code: 'auth.third_party_application_forbidden',
        status: 403,
      });

      // The Verification API is a separate router with its own wiring, so cover it too. Minting a
      // record here is what would otherwise let a third-party application reach the guarded routes.
      await expectRejects(createVerificationRecordByPassword(api, password), {
        code: 'auth.third_party_application_forbidden',
        status: 403,
      });
    } finally {
      await Promise.all([deleteApplication(app.id), deleteDefaultTenantUser(user.id)]);
    }
  });

  it('should keep account reads available to a third-party application', async () => {
    const { user, username, password } = await createDefaultTenantUserWithPassword();
    const { app, api } = await buildAccountApi(true, username, password);

    try {
      await expect(getUserInfo(api)).resolves.toMatchObject({ id: user.id });
    } finally {
      await Promise.all([deleteApplication(app.id), deleteDefaultTenantUser(user.id)]);
    }
  });

  it('should keep account mutations available to a first-party application', async () => {
    const { user, username, password } = await createDefaultTenantUserWithPassword();
    const { app, api } = await buildAccountApi(false, username, password);
    const name = generateName();

    try {
      await expect(updateUser(api, { name })).resolves.toMatchObject({ name });
    } finally {
      await Promise.all([deleteApplication(app.id), deleteDefaultTenantUser(user.id)]);
    }
  });
});
