import { UserScope } from '@logto/core-kit';
import { MfaFactor } from '@logto/schemas';

import { enableAllAccountCenterFields } from '#src/api/account-center.js';
import {
  createWebAuthnRegistrationOptions,
  verifyWebAuthnRegistration,
} from '#src/api/verification-record.js';
import { logtoUrl } from '#src/constants.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  createDefaultTenantUserWithPassword,
  deleteDefaultTenantUser,
  signInAndGetUserApi,
} from '#src/helpers/profile.js';
import {
  enableAllPasswordSignInMethods,
  enableUserControlledMfaWithTotpAndWebAuthn,
  resetMfaSettings,
} from '#src/helpers/sign-in-experience.js';

describe('my-account (mfa - WebAuthn)', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await enableAllAccountCenterFields();
    await enableUserControlledMfaWithTotpAndWebAuthn();
  });

  afterAll(async () => {
    await resetMfaSettings();
  });

  describe('POST /my-account/mfa-verifications/web-authn/registration', () => {
    it('should be able to get webauthn registration options', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile],
      });

      const { verificationRecordId, registrationOptions } =
        await createWebAuthnRegistrationOptions(api);

      expect(verificationRecordId).toBeTruthy();
      expect(registrationOptions.rp.name).toBe(new URL(logtoUrl).hostname);
      expect(registrationOptions.user.displayName).toBe(user.username);

      await deleteDefaultTenantUser(user.id);
    });

    it('should be able to verify webauthn registration', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile],
      });

      const {
        verificationRecordId,
        registrationOptions: {
          rp: { id: rpId },
          challenge,
        },
      } = await createWebAuthnRegistrationOptions(api);

      const expectedHost = new URL(logtoUrl).hostname;
      const rawId = Buffer.from(rpId ?? expectedHost)
        .toString('base64')
        .replaceAll('+', '-')
        .replaceAll('/', '_')
        .replace(/=+$/, '');

      // This error is expected because the mock registration response
      // can not pass the server side validation.
      await expectRejects(
        verifyWebAuthnRegistration(api, verificationRecordId, {
          type: MfaFactor.WebAuthn,
          id: rawId,
          rawId,
          response: {
            clientDataJSON: Buffer.from(
              JSON.stringify({
                type: 'webauthn.create',
                challenge,
                origin: logtoUrl,
                crossOrigin: false,
              })
            ).toString('base64url'),
            attestationObject: rawId,
          },
          clientExtensionResults: {},
        }),
        {
          code: 'session.mfa.webauthn_verification_failed',
          status: 400,
        }
      );

      await deleteDefaultTenantUser(user.id);
    });
  });
});
