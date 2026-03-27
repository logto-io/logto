import { UserScope } from '@logto/core-kit';

import { enableAllAccountCenterFields } from '#src/api/account-center.js';
import { authedAdminApi } from '#src/api/api.js';
import { deleteApplication } from '#src/api/application.js';
import { getMyAccountGrants } from '#src/api/my-account.js';
import { createVerificationRecordByPassword } from '#src/api/verification-record.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  createDefaultTenantUserWithPassword,
  deleteDefaultTenantUser,
  signInAndGetUserApi,
} from '#src/helpers/profile.js';
import { createAppAndSignInWithPassword } from '#src/helpers/session.js';
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
});
