import { UserScope } from '@logto/core-kit';
import { AccountCenterControlValue } from '@logto/schemas';
import { assert } from '@silverhand/essentials';

import { enableAllAccountCenterFields, updateAccountCenter } from '#src/api/account-center.js';
import { getUserApplicationGrants } from '#src/api/admin-user.js';
import { authedAdminApi } from '#src/api/api.js';
import { deleteApplication } from '#src/api/application.js';
import { getMyAccountGrants, getSessions, revokeMyAccountGrant } from '#src/api/my-account.js';
import { createVerificationRecordByPassword } from '#src/api/verification-record.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  createDefaultTenantUserWithPassword,
  deleteDefaultTenantUser,
  signInAndGetUserApi,
} from '#src/helpers/profile.js';
import {
  assertRefreshTokenInvalidGrant,
  createAppAndSignInWithPassword,
  findSessionByAppId,
} from '#src/helpers/session.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { devFeatureTest } from '#src/utils.js';

devFeatureTest.describe('account center grant management', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await enableAllAccountCenterFields(authedAdminApi);
  });

  describe('GET /my-account/grants', () => {
    it('should fail if scope is missing', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password);

      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      await expectRejects(getMyAccountGrants(api, verificationRecordId), {
        code: 'auth.unauthorized',
        status: 401,
      });

      await deleteDefaultTenantUser(user.id);
    });

    it('should fail if identity is not verified', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Sessions],
      });

      await expectRejects(getMyAccountGrants(api, ''), {
        code: 'verification_record.permission_denied',
        status: 401,
      });

      await deleteDefaultTenantUser(user.id);
    });

    it('should get grants successfully and support appType filters', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();

      const firstPartySignIn = await createAppAndSignInWithPassword({
        username,
        password,
        isThirdParty: false,
        scopes: [UserScope.Profile],
      });

      const thirdPartySignIn = await createAppAndSignInWithPassword({
        username,
        password,
        isThirdParty: true,
        scopes: [UserScope.Profile],
      });

      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Sessions],
      });

      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      const { grants: allGrants } = await getMyAccountGrants(api, verificationRecordId);
      expect(allGrants.length).toBeGreaterThanOrEqual(2);
      expect(allGrants.some((grant) => grant.payload.clientId === firstPartySignIn.app.id)).toBe(
        true
      );
      expect(allGrants.some((grant) => grant.payload.clientId === thirdPartySignIn.app.id)).toBe(
        true
      );

      const { grants: firstPartyGrants } = await getMyAccountGrants(
        api,
        verificationRecordId,
        'firstParty'
      );
      expect(firstPartyGrants.length).toBeGreaterThanOrEqual(1);
      expect(
        firstPartyGrants.some((grant) => grant.payload.clientId === firstPartySignIn.app.id)
      ).toBe(true);
      expect(
        firstPartyGrants.some((grant) => grant.payload.clientId === thirdPartySignIn.app.id)
      ).toBe(false);

      const { grants: thirdPartyGrants } = await getMyAccountGrants(
        api,
        verificationRecordId,
        'thirdParty'
      );
      expect(thirdPartyGrants.length).toBeGreaterThanOrEqual(1);
      expect(
        thirdPartyGrants.some((grant) => grant.payload.clientId === thirdPartySignIn.app.id)
      ).toBe(true);
      expect(
        thirdPartyGrants.some((grant) => grant.payload.clientId === firstPartySignIn.app.id)
      ).toBe(false);

      await Promise.all([
        deleteApplication(firstPartySignIn.app.id),
        deleteApplication(thirdPartySignIn.app.id),
      ]);
      await deleteDefaultTenantUser(user.id);
    });
  });

  describe('DELETE /my-account/grants/:grantId', () => {
    it('should fail if scope is missing', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();

      const { app } = await createAppAndSignInWithPassword({
        username,
        password,
        scopes: [UserScope.Profile],
      });

      const api = await signInAndGetUserApi(username, password);
      const verificationRecordId = await createVerificationRecordByPassword(api, password);
      const { grants } = await getUserApplicationGrants(user.id);
      const grant = grants.find((item) => item.payload.clientId === app.id);
      assert(grant, new Error('Grant not found for application'));

      await expectRejects(revokeMyAccountGrant(api, grant.id, verificationRecordId), {
        code: 'auth.unauthorized',
        status: 401,
      });

      await deleteApplication(app.id);
      await deleteDefaultTenantUser(user.id);
    });

    it('should fail if session field is not editable', async () => {
      await updateAccountCenter({
        enabled: true,
        fields: {
          session: AccountCenterControlValue.ReadOnly,
        },
      });

      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const { app } = await createAppAndSignInWithPassword({
        username,
        password,
        scopes: [UserScope.Profile],
      });

      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Sessions],
      });
      const verificationRecordId = await createVerificationRecordByPassword(api, password);
      const { grants } = await getUserApplicationGrants(user.id);
      const grant = grants.find((item) => item.payload.clientId === app.id);
      assert(grant, new Error('Grant not found for application'));

      await expectRejects(revokeMyAccountGrant(api, grant.id, verificationRecordId), {
        code: 'account_center.field_not_editable',
        status: 400,
      });

      await deleteApplication(app.id);
      await deleteDefaultTenantUser(user.id);
      await enableAllAccountCenterFields(authedAdminApi);
    });

    it('should fail if identity is not verified', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();

      const { app } = await createAppAndSignInWithPassword({
        username,
        password,
        scopes: [UserScope.Profile],
      });

      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Sessions],
      });
      const verifiedRecordId = await createVerificationRecordByPassword(api, password);
      const { grants } = await getMyAccountGrants(api, verifiedRecordId);
      const grant = grants.find((item) => item.payload.clientId === app.id);
      assert(grant, new Error('Grant not found for application'));

      await expectRejects(revokeMyAccountGrant(api, grant.id, ''), {
        code: 'verification_record.permission_denied',
        status: 401,
      });

      await deleteApplication(app.id);
      await deleteDefaultTenantUser(user.id);
    });

    it('should revoke grant by grant id', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();

      const { app, refreshToken } = await createAppAndSignInWithPassword({
        username,
        password,
        scopes: [UserScope.Profile],
      });

      assert(refreshToken, new Error('No refresh token found'));

      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Sessions],
      });
      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      const { grants } = await getMyAccountGrants(api, verificationRecordId);
      const grant = grants.find((item) => item.payload.clientId === app.id);
      assert(grant, new Error('Grant not found for application'));

      await revokeMyAccountGrant(api, grant.id, verificationRecordId);

      await assertRefreshTokenInvalidGrant({
        clientId: app.id,
        refreshToken,
      });

      const { sessions } = await getSessions(api, verificationRecordId);
      const appSession = findSessionByAppId(sessions, app.id);
      expect(appSession).toBeUndefined();

      await deleteApplication(app.id);
      await deleteDefaultTenantUser(user.id);
    });
  });
});
