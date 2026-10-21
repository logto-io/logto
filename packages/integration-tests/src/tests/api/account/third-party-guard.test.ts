import { UserScope } from '@logto/core-kit';

import { enableAllAccountCenterFields } from '#src/api/account-center.js';
import { authedAdminApi, baseApi } from '#src/api/api.js';
import { deleteApplication } from '#src/api/application.js';
import {
  getBackupCodes,
  getMyAccountGrants,
  getSessions,
  getTrustedDevicesResponse,
  getUserInfo,
  updatePassword,
  updateUser,
} from '#src/api/my-account.js';
import { createVerificationRecordByPassword } from '#src/api/verification-record.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  createDefaultTenantUserWithPassword,
  deleteDefaultTenantUser,
  signInAndGetUserApi,
} from '#src/helpers/profile.js';
import { createAppAndSignInWithPassword } from '#src/helpers/session.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateName, generatePassword } from '#src/utils.js';

const buildAccountApi = async (
  isThirdParty: boolean,
  username: string,
  password: string,
  scopes: UserScope[] = [UserScope.Profile]
) => {
  const { app, client } = await createAppAndSignInWithPassword({
    username,
    password,
    isThirdParty,
    scopes,
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

  it('should reject account reads that need recent authentication from a third-party application', async () => {
    const { user, username, password } = await createDefaultTenantUserWithPassword();
    const { app, api } = await buildAccountApi(true, username, password, [
      UserScope.Profile,
      UserScope.Identities,
      UserScope.Sessions,
      UserScope.TrustedDevices,
    ]);
    // A third-party application cannot mint a verification record — the Verification API refuses it
    // — so mint one through a first-party client. The record belongs to the user, not to a client,
    // so a third-party request can present it and reach the guard under test.
    const firstPartyApi = await signInAndGetUserApi(username, password);
    const verificationRecordId = await createVerificationRecordByPassword(firstPartyApi, password);

    try {
      await expectRejects(getSessions(api, verificationRecordId), {
        code: 'auth.third_party_application_forbidden',
        status: 403,
      });
      await expectRejects(getMyAccountGrants(api, verificationRecordId), {
        code: 'auth.third_party_application_forbidden',
        status: 403,
      });
      await expectRejects(getBackupCodes(api, verificationRecordId), {
        code: 'auth.third_party_application_forbidden',
        status: 403,
      });
      await expectRejects(getTrustedDevicesResponse(api, verificationRecordId), {
        code: 'auth.third_party_application_forbidden',
        status: 403,
      });
    } finally {
      await Promise.all([deleteApplication(app.id), deleteDefaultTenantUser(user.id)]);
    }
  });
});
