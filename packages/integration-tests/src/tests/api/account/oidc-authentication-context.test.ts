import { UserScope } from '@logto/core-kit';
import { type KyInstance } from 'ky';

import { enableAllAccountCenterFields } from '#src/api/account-center.js';
import { authedAdminApi } from '#src/api/api.js';
import { getSessions, updateMyLogtoConfig } from '#src/api/my-account.js';
import { createVerificationRecordByPassword } from '#src/api/verification-record.js';
import {
  createDefaultTenantUserWithPassword,
  deleteDefaultTenantUser,
  signInAndGetUserApi,
  signInWithSocialAndGetUserApi,
} from '#src/helpers/profile.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { devFeatureTest } from '#src/utils.js';

/** Read the trusted devices, keeping the response so a `401` challenge can be inspected. */
const getTrustedDevicesResponse = async (api: KyInstance) =>
  api.get('api/my-account/trusted-devices', {
    headers: { 'logto-verification-id': '' },
    throwHttpErrors: false,
  });

describe('account API authentication context', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await enableAllAccountCenterFields(authedAdminApi);
  });

  devFeatureTest.it(
    'accepts a fresh first-party sign-in without a verification record',
    async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [
          UserScope.Profile,
          UserScope.Identities,
          UserScope.Sessions,
          UserScope.TrustedDevices,
        ],
      });

      try {
        // A mutation that needs recent authentication.
        await expect(updateMyLogtoConfig(api, { mfa: { skipped: true } })).resolves.toMatchObject({
          mfa: { skipped: true },
        });

        // Reads that need it as well.
        await expect(getSessions(api, '')).resolves.toBeDefined();
        const response = await getTrustedDevicesResponse(api);
        expect(response.status).toBe(200);
      } finally {
        await deleteDefaultTenantUser(user.id);
      }
    }
  );

  it('still accepts a verification record when the token carries no authentication context', async () => {
    const { user, password } = await createDefaultTenantUserWithPassword();
    // A social sign-in carries no `acr`, so the legacy verification record is the only proof.
    const api = await signInWithSocialAndGetUserApi(user.id, {
      scopes: [UserScope.Profile, UserScope.Identities],
    });

    try {
      const verificationRecordId = await createVerificationRecordByPassword(api, password);
      await expect(
        updateMyLogtoConfig(api, { mfa: { skipped: true } }, verificationRecordId)
      ).resolves.toMatchObject({ mfa: { skipped: true } });
    } finally {
      await deleteDefaultTenantUser(user.id);
    }
  });

  devFeatureTest.it(
    'answers a first-party caller without recent authentication with the RFC 9470 challenge',
    async () => {
      const { user } = await createDefaultTenantUserWithPassword();
      const api = await signInWithSocialAndGetUserApi(user.id, {
        scopes: [UserScope.Profile, UserScope.TrustedDevices],
      });

      try {
        const response = await getTrustedDevicesResponse(api);

        expect(response.status).toBe(401);
        await expect(response.json()).resolves.toMatchObject({
          code: 'verification_record.permission_denied',
        });
        expect(response.headers.get('WWW-Authenticate')).toBe(
          'Bearer error="insufficient_user_authentication", ' +
            'error_description="Recent user authentication is required", ' +
            'acr_values="urn:logto:acr:1fa", max_age="600"'
        );
      } finally {
        await deleteDefaultTenantUser(user.id);
      }
    }
  );
});
