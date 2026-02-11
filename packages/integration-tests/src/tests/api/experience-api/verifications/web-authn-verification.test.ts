import { MfaFactor, SignInIdentifier } from '@logto/schemas';

import { initExperienceClient } from '#src/helpers/client.js';
import { expectRejects } from '#src/helpers/index.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';
import { devFeatureTest } from '#src/utils.js';

const { describe, it } = devFeatureTest;

/**
 * Create a mock WebAuthn authentication verification payload.
 * Note: This cannot pass server-side crypto validation, but is useful for testing
 * that the API endpoint processes the request structure correctly.
 */
const createMockWebAuthnAuthenticationPayload = () => {
  const rawId = Buffer.from('mock-credential-id')
    .toString('base64')
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/, '');

  return {
    type: MfaFactor.WebAuthn,
    id: rawId,
    rawId,
    response: {
      clientDataJSON: Buffer.from(
        JSON.stringify({
          type: 'webauthn.get',
          challenge: 'mock-challenge',
          origin: 'https://localhost',
          crossOrigin: false,
        })
      ).toString('base64url'),
      authenticatorData: Buffer.from('mock-authenticator-data').toString('base64url'),
      signature: Buffer.from('mock-signature').toString('base64url'),
      userHandle: Buffer.from('mock-user-handle').toString('base64url'),
    },
    clientExtensionResults: {},
  };
};

describe('identifier-first passkey sign-in verification', () => {
  const userApi = new UserApiTest();

  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
  });

  afterEach(async () => {
    await userApi.cleanUp();
  });

  describe('POST /experience/verification/sign-in-web-authn/authentication', () => {
    it('should return 400 if user has no WebAuthn credentials', async () => {
      const { username, password } = generateNewUserProfile({ username: true, password: true });
      await userApi.create({ username, password });

      const client = await initExperienceClient();

      // User exists but has no WebAuthn credentials registered
      await expectRejects(
        client.createSignInWebAuthnAuthentication({
          identifier: {
            type: SignInIdentifier.Username,
            value: username,
          },
        }),
        {
          code: 'session.mfa.webauthn_verification_not_found',
          status: 400,
        }
      );
    });
  });

  describe('POST /experience/verification/sign-in-web-authn/authentication/verify', () => {
    it('should return error if verification record not found for given verificationId', async () => {
      const client = await initExperienceClient();

      await expectRejects(
        client.verifySignInWebAuthnAuthentication({
          verificationId: 'non-existent-verification-id',
          payload: createMockWebAuthnAuthenticationPayload(),
        }),
        {
          code: 'session.verification_session_not_found',
          status: 404,
        }
      );
    });

    it('should return error when verifying without verificationId and without preflight challenge', async () => {
      const client = await initExperienceClient();

      // When no verificationId is provided and no preflight challenge exists in the interaction,
      // the server should fail to find the authentication challenge
      await expectRejects(
        client.verifySignInWebAuthnAuthentication({
          payload: createMockWebAuthnAuthenticationPayload(),
        }),
        {
          code: 'session.verification_session_not_found',
          status: 404,
        }
      );
    });
  });
});
