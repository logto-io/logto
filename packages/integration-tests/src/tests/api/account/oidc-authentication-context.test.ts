import { UserScope } from '@logto/core-kit';
import { type KyInstance } from 'ky';

import {
  enableAllAccountCenterFields,
  getAccountCenter,
  updateAccountCenter,
} from '#src/api/account-center.js';
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

const getChallengeMaxAge = (response: Awaited<ReturnType<typeof getTrustedDevicesResponse>>) =>
  /max_age="(\d+)"/.exec(response.headers.get('WWW-Authenticate') ?? '')?.[1];

/**
 * Configure the tenant window, then prove that a sign-in made right after it is recent enough:
 * the shortest window is the strictest case the tenant can ask for.
 */
const expectFreshSignInAccepted = async (maximumAuthenticationAgeInSeconds: number) => {
  await updateAccountCenter({ maximumAuthenticationAgeInSeconds });

  const { user, username, password } = await createDefaultTenantUserWithPassword();

  try {
    const api = await signInAndGetUserApi(username, password, {
      scopes: [UserScope.Profile, UserScope.TrustedDevices],
    });
    const response = await getTrustedDevicesResponse(api);

    expect(response.status).toBe(200);
  } finally {
    await deleteDefaultTenantUser(user.id);
  }
};

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

  devFeatureTest.it(
    'advertises the tenant maximum authentication age in the challenge',
    async () => {
      const { user } = await createDefaultTenantUserWithPassword();
      const api = await signInWithSocialAndGetUserApi(user.id, {
        scopes: [UserScope.Profile, UserScope.TrustedDevices],
      });
      const originalAccountCenter = await getAccountCenter();

      try {
        await updateAccountCenter({ maximumAuthenticationAgeInSeconds: 7200 });

        const response = await getTrustedDevicesResponse(api);
        expect(response.status).toBe(401);
        expect(getChallengeMaxAge(response)).toBe('7200');
        // The challenge and the Account Center setting that the client reads carry the same value.
        await expect(getAccountCenter()).resolves.toMatchObject({
          maximumAuthenticationAgeInSeconds: 7200,
        });
      } finally {
        await updateAccountCenter({
          maximumAuthenticationAgeInSeconds:
            originalAccountCenter.maximumAuthenticationAgeInSeconds,
        });
        await deleteDefaultTenantUser(user.id);
      }
    }
  );

  devFeatureTest.it(
    'accepts a fresh first-party sign-in at both ends of the configurable range',
    async () => {
      const originalAccountCenter = await getAccountCenter();

      try {
        await expectFreshSignInAccepted(60);
        await expectFreshSignInAccepted(7200);
      } finally {
        await updateAccountCenter({
          maximumAuthenticationAgeInSeconds:
            originalAccountCenter.maximumAuthenticationAgeInSeconds,
        });
      }
    }
  );
});
