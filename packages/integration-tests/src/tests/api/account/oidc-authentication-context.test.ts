import { ConnectorType } from '@logto/connector-kit';
import { UserScope } from '@logto/core-kit';
import {
  ApplicationType,
  InteractionEvent,
  LogtoAcr,
  MfaFactor,
  SignInIdentifier,
  accountCenterApplicationId,
  demoAppApplicationId,
  type Application,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { type KyInstance } from 'ky';
import { authenticator } from 'otplib';

import { enableAllAccountCenterFields } from '#src/api/account-center.js';
import { createUserMfaVerification, updateUserLogtoConfig } from '#src/api/admin-user.js';
import { authedAdminApi, baseApi } from '#src/api/api.js';
import { createApplication, deleteApplication } from '#src/api/application.js';
import {
  getUserInfo,
  getSessions,
  updateMyLogtoConfig,
  updatePrimaryEmail,
} from '#src/api/my-account.js';
import {
  createAndVerifyVerificationCode,
  createVerificationRecordByPassword,
} from '#src/api/verification-record.js';
import { demoAppRedirectUri, logtoUrl } from '#src/constants.js';
import { initExperienceClient, processSession } from '#src/helpers/client.js';
import { clearConnectorsByTypes, setEmailConnector } from '#src/helpers/connector.js';
import { authorizeWithSession } from '#src/helpers/experience/authorization.js';
import { successfullyVerifyTotp } from '#src/helpers/experience/totp-verification.js';
import {
  createDefaultTenantUserWithPassword,
  deleteDefaultTenantUser,
  signInAndGetUserApi,
  signInWithSocialAndGetUserApi,
} from '#src/helpers/profile.js';
import {
  enableAllPasswordSignInMethods,
  enableUserControlledMfaWithNoPrompt,
  resetMfaSettings,
} from '#src/helpers/sign-in-experience.js';
import { devFeatureTest, generateEmail, generateTestName } from '#src/utils.js';

/**
 * Read the trusted devices, keeping the response so a `401` challenge can be inspected. An empty
 * `logto-verification-id` is what a client that only relies on its access token sends.
 */
const getTrustedDevicesResponse = async (api: KyInstance, verificationRecordId = '') =>
  api.get('api/my-account/trusted-devices', {
    headers: { 'logto-verification-id': verificationRecordId },
    throwHttpErrors: false,
  });

const expectPermissionDeniedWithChallenge = async (response: Response) => {
  expect(response.status).toBe(401);
  await expect(response.json()).resolves.toMatchObject({
    code: 'verification_record.permission_denied',
  });
  expect(response.headers.get('WWW-Authenticate')).toBe(
    'Bearer error="insufficient_user_authentication", ' +
      'error_description="Recent user authentication is required", ' +
      `acr_values="${LogtoAcr.FirstFactor}", max_age="600"`
  );
};

/** A developer-created first-party application that can reach the sensitive account routes. */
const createFirstPartyApplication = async () => {
  const app = await createApplication(generateTestName(), ApplicationType.SPA, {
    oidcClientMetadata: { redirectUris: [demoAppRedirectUri], postLogoutRedirectUris: [] },
    customClientMetadata: { alwaysIssueRefreshToken: true },
  });

  return app;
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

  devFeatureTest.it(
    'accepts the opaque Account Center access token through normal token authentication',
    async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      // The built-in Account Center signs in as its own application, so the access token it sends
      // to the Account API is the one the OIDC context has to reach through the token itself.
      // The scopes are a subset of the ones the built-in Account Center requests; the reserved
      // scopes come from the client's default `includeReservedScopes`.
      const client = await initExperienceClient({
        config: {
          appId: accountCenterApplicationId,
          scopes: [
            UserScope.Profile,
            UserScope.Identities,
            UserScope.Sessions,
            UserScope.TrustedDevices,
          ],
        },
        redirectUri: `${logtoUrl}/account`,
      });
      const { verificationId } = await client.verifyPassword({
        identifier: { type: SignInIdentifier.Username, value: username },
        password,
      });
      await client.identifyUser({ verificationId });
      const { redirectTo } = await client.submitInteraction();
      await processSession(client, redirectTo);

      const accessToken = await client.getAccessToken();
      // The Account Center reads the context from its ID token and treats the access token as
      // opaque; a JWT here would mean the test proves the wrong token shape.
      expect(accessToken.split('.')).toHaveLength(1);

      const api = baseApi.extend({ headers: { Authorization: `Bearer ${accessToken}` } });

      try {
        await expect(getSessions(api, '')).resolves.toBeDefined();
        await expect(getTrustedDevicesResponse(api)).resolves.toHaveProperty('status', 200);
        await expect(updateMyLogtoConfig(api, { mfa: { skipped: true } })).resolves.toMatchObject({
          mfa: { skipped: true },
        });
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
        await expectPermissionDeniedWithChallenge(await getTrustedDevicesResponse(api));
      } finally {
        await deleteDefaultTenantUser(user.id);
      }
    }
  );

  describe('with an enrolled MFA factor', () => {
    beforeAll(async () => {
      await enableUserControlledMfaWithNoPrompt();
    });

    afterAll(async () => {
      await resetMfaSettings();
    });

    devFeatureTest.it('accepts an elevated mfa token without a verification record', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const totp = await createUserMfaVerification(user.id, MfaFactor.TOTP);

      if (totp.type !== MfaFactor.TOTP) {
        throw new Error('Expected a TOTP factor');
      }

      // The sign-in itself must not ask for the factor; the requested `mfa` in the step-up does.
      await updateUserLogtoConfig(user.id, {
        mfa: { skipMfaOnSignIn: true },
        passkeySignIn: {},
      });

      const client = await initExperienceClient({
        config: {
          appId: demoAppApplicationId,
          scopes: [UserScope.Profile, UserScope.Sessions],
        },
        redirectUri: demoAppRedirectUri,
      });

      try {
        const { verificationId } = await client.verifyPassword({
          identifier: { type: SignInIdentifier.Username, value: username },
          password,
        });
        await client.identifyUser({ verificationId });
        const { redirectTo } = await client.submitInteraction();
        await processSession(client, redirectTo);

        // Elevate the existing session from the password sign-in's `1fa` to `mfa`.
        const { status, location } = await authorizeWithSession(client, {
          extraParams: { acr_values: LogtoAcr.Mfa },
        });
        expect(status).toBe(303);
        expect(location.startsWith('/step-up')).toBe(true);
        await client.initInteraction({ interactionEvent: InteractionEvent.SignIn });
        await successfullyVerifyTotp(client, { code: authenticator.generate(totp.secret) });
        const { redirectTo: stepUpRedirectTo } = await client.submitInteraction();
        await client.resumeAuthorization(stepUpRedirectTo);

        // The step-up replaced the token set, so the token under test really is elevated.
        await expect(client.getIdTokenClaims()).resolves.toMatchObject({
          acr: LogtoAcr.Mfa,
        });

        const api = baseApi.extend({
          headers: { Authorization: `Bearer ${await client.getAccessToken()}` },
        });
        await expect(getSessions(api, '')).resolves.toBeDefined();
      } finally {
        await deleteDefaultTenantUser(user.id);
      }
    });
  });

  describe('legacy verification records', () => {
    // eslint-disable-next-line @silverhand/fp/no-let -- assigned by the fixtures
    let application: Application;

    beforeAll(async () => {
      await setEmailConnector();
      // eslint-disable-next-line @silverhand/fp/no-mutation
      application = await createFirstPartyApplication();
    });

    afterAll(async () => {
      await clearConnectorsByTypes([ConnectorType.Email]);
      await deleteApplication(application.id);
    });

    /**
     * A developer-created first-party application whose token carries no authentication context,
     * which is the integration the legacy `logto-verification-id` contract exists for.
     */
    const signInWithoutContext = async (
      userId: string,
      scopes: UserScope[] = [
        UserScope.Profile,
        UserScope.Identities,
        UserScope.Sessions,
        UserScope.TrustedDevices,
      ]
    ) =>
      signInWithSocialAndGetUserApi(userId, {
        appId: application.id,
        scopes,
      });

    it('accepts a valid verification record from a developer-created integration', async () => {
      const { user, password } = await createDefaultTenantUserWithPassword();
      const api = await signInWithoutContext(user.id);

      try {
        const verificationRecordId = await createVerificationRecordByPassword(api, password);
        await expect(getSessions(api, verificationRecordId)).resolves.toBeDefined();
      } finally {
        await deleteDefaultTenantUser(user.id);
      }
    });

    devFeatureTest.it('rejects a verification record that does not exist', async () => {
      const { user } = await createDefaultTenantUserWithPassword();
      const api = await signInWithoutContext(user.id);

      try {
        await expectPermissionDeniedWithChallenge(
          await getTrustedDevicesResponse(api, generateStandardId())
        );
      } finally {
        await deleteDefaultTenantUser(user.id);
      }
    });

    devFeatureTest.it("rejects another user's verification record", async () => {
      const { user } = await createDefaultTenantUserWithPassword();
      const { user: otherUser, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInWithoutContext(user.id);
      const otherApi = await signInAndGetUserApi(username, password);

      try {
        // A valid, verified record — but it proves the wrong account.
        const otherVerificationRecordId = await createVerificationRecordByPassword(
          otherApi,
          password
        );
        await expectPermissionDeniedWithChallenge(
          await getTrustedDevicesResponse(api, otherVerificationRecordId)
        );
      } finally {
        await Promise.all([
          deleteDefaultTenantUser(user.id),
          deleteDefaultTenantUser(otherUser.id),
        ]);
      }
    });

    devFeatureTest.it('rejects a verification record created for another purpose', async () => {
      const { user } = await createDefaultTenantUserWithPassword();
      const api = await signInWithoutContext(user.id);

      try {
        // A code sent to an address that is not the user's primary one creates a
        // `BindNewIdentifier` record: it may bind the identifier, but it is not the
        // `UserPermissionValidation` proof a sensitive Account API operation needs.
        const bindNewIdentifierRecordId = await createAndVerifyVerificationCode(api, {
          type: SignInIdentifier.Email,
          value: generateEmail(),
        });
        await expectPermissionDeniedWithChallenge(
          await getTrustedDevicesResponse(api, bindNewIdentifierRecordId)
        );
      } finally {
        await deleteDefaultTenantUser(user.id);
      }
    });
  });

  describe('identifier binding', () => {
    beforeAll(async () => {
      await setEmailConnector();
    });

    afterAll(async () => {
      await clearConnectorsByTypes([ConnectorType.Email]);
    });

    devFeatureTest.it(
      'keeps using the Verification API record to bind a new identifier',
      async () => {
        const { user, username, password } = await createDefaultTenantUserWithPassword();
        const api = await signInAndGetUserApi(username, password, {
          scopes: [UserScope.Profile, UserScope.Email],
        });
        const newEmail = generateEmail();

        try {
          const bindingVerificationRecordId = await createAndVerifyVerificationCode(api, {
            type: SignInIdentifier.Email,
            value: newEmail,
          });

          // The fresh `1fa` context replaces the permission record, not the identifier binding one:
          // the record still comes from the Verification API and is still required.
          await expect(
            updatePrimaryEmail(api, newEmail, '', bindingVerificationRecordId)
          ).resolves.toBeDefined();
          await expect(getUserInfo(api)).resolves.toHaveProperty('primaryEmail', newEmail);
        } finally {
          await deleteDefaultTenantUser(user.id);
        }
      }
    );
  });
});
