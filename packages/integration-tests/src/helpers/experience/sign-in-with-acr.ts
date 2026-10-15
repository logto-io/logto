import { createHash, randomBytes } from 'node:crypto';

import { type IdTokenClaims } from '@logto/js';
import {
  MfaFactor,
  SignInIdentifier,
  defaultTenantId,
  type WebAuthnAuthenticationOptions,
  type WebAuthnVerificationPayload,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { assert } from '@silverhand/essentials';
import { sql, type DatabasePool } from '@silverhand/slonik';

import { createUserMfaVerification, postUserIdentity } from '#src/api/admin-user.js';
import api from '#src/api/api.js';
import { experienceRoutes } from '#src/client/experience/const.js';
import { type ExperienceClient } from '#src/client/experience/index.js';
import { initExperienceClient, processSession } from '#src/helpers/client.js';
import {
  successfullyCreateSocialVerification,
  successfullyVerifySocialAuthorization,
} from '#src/helpers/experience/social-verification.js';
import { VirtualPasskey } from '#src/helpers/experience/webauthn.js';

export const firstFactorAcr = 'urn:logto:acr:1fa';
export const mfaAcr = 'urn:logto:acr:mfa';

export const nowInSeconds = () => Math.floor(Date.now() / 1000);

/** Start a sign-in without an OIDC session whose authorization request carries `acr_values`. */
export const initSignInWithAcr = async (acrValues: string) =>
  initExperienceClient({ options: { extraParams: { acr_values: acrValues } } });

/** Submit, finish the authorization, and return the ID token claims it issued. */
export const finishSignIn = async (client: ExperienceClient) => {
  const { redirectTo } = await client.submitInteraction();
  await processSession(client, redirectTo);

  return client.getIdTokenClaims();
};

/** Expect the claims to carry the context, authenticated no earlier than `authenticatedAfter`. */
export const expectAuthenticationContext = (
  claims: IdTokenClaims,
  expected: Partial<IdTokenClaims>,
  authenticatedAfter: number
) => {
  expect(claims).toMatchObject(expected);
  expect(claims.auth_time).toBeGreaterThanOrEqual(authenticatedAfter);
  expect(claims.auth_time).toBeLessThanOrEqual(nowInSeconds());
};

export const createTotp = async (userId: string) => {
  const totp = await createUserMfaVerification(userId, MfaFactor.TOTP);
  assert(totp.type === MfaFactor.TOTP, new Error('unexpected MFA factor type'));

  return totp.secret;
};

/**
 * Enroll a software passkey for the user, stored the way a WebAuthn registration stores it. The
 * Management API cannot add a WebAuthn factor, so it is appended to the user row directly.
 */
export const enrollPasskey = async (pool: DatabasePool, userId: string) => {
  const passkey = new VirtualPasskey();
  await pool.query(sql`
    update users
    set mfa_verifications = mfa_verifications || ${sql.jsonb([passkey.mfaVerification])}
    where tenant_id = ${defaultTenantId} and id = ${userId}
  `);

  return passkey;
};

/** Link a mock social identity to the user, so a social sign-in resolves to them. */
export const linkSocialIdentity = async (userId: string, connectorId: string) => {
  const socialUserId = generateStandardId();
  await postUserIdentity(userId, connectorId, {
    code: 'fake_code',
    userId: socialUserId,
    redirectUri: 'http://localhost:3000',
  });

  return socialUserId;
};

/**
 * Answer a WebAuthn challenge for the identified user with the passkey, the way the SPA does on
 * the reused MFA verification page. Resolves with the verified record's ID.
 */
export const verifyWebAuthnAuthentication = async (
  client: ExperienceClient,
  answer: (challenge: string) => WebAuthnVerificationPayload
) => {
  const headers = { cookie: client.interactionCookie };
  const { verificationId, authenticationOptions } = await api
    .post(`${experienceRoutes.verification}/web-authn/authentication`, { headers })
    .json<{ verificationId: string; authenticationOptions: WebAuthnAuthenticationOptions }>();

  return api
    .post(`${experienceRoutes.verification}/web-authn/authentication/verify`, {
      headers,
      json: { verificationId, payload: answer(authenticationOptions.challenge) },
    })
    .json<{ verificationId: string }>();
};

/**
 * Sign in with the passkey through the identifier-first passkey ceremony, the way the SPA does,
 * and identify the user. The request carries `type: WebAuthn`, which the server requires.
 */
export const identifyWithPasskey = async (
  client: ExperienceClient,
  username: string,
  answer: (challenge: string) => WebAuthnVerificationPayload
) => {
  const { verificationId, authenticationOptions } = await client.createSignInPasskeyAuthentication({
    identifier: { type: SignInIdentifier.Username, value: username },
  });
  await api.post(`${experienceRoutes.verification}/sign-in-passkey/authentication/verify`, {
    headers: { cookie: client.interactionCookie },
    json: { verificationId, payload: answer(authenticationOptions.challenge) },
  });
  await client.identifyUser({ verificationId });
};

/** Trust a device for the user, and hand its credential cookie to the client. */
export const trustDevice = async (pool: DatabasePool, client: ExperienceClient, userId: string) => {
  const id = generateStandardId();
  const secret = randomBytes(32).toString('base64url');
  const secretHash = createHash('sha256').update(Buffer.from(secret, 'base64url')).digest();
  const cookieName = `logto-trusted-device-${createHash('sha256')
    .update(`${defaultTenantId}:${userId}`)
    .digest('base64url')}`;

  await pool.query(sql`
    insert into trusted_devices
      (tenant_id, id, user_id, secret_hash, created_at, last_used_at, expires_at)
    values (
      ${defaultTenantId}, ${id}, ${userId}, ${sql.binary(secretHash)}, now(), now(),
      now() + interval '1 day'
    )
  `);
  client.mergeRawCookies([`${cookieName}=${id}.${secret}; path=/`]);
};

/** Answer the trusted-device opt-in the tenant's policy suggested. */
export const setTrustedDeviceOptInDecision = async (client: ExperienceClient, trusted: boolean) =>
  api.post(`${experienceRoutes.profile}/trusted-device`, {
    headers: { cookie: client.interactionCookie },
    json: { trusted },
  });

/** Verify the mock social identity and identify its user, without submitting. */
export const identifyWithSocial = async (
  client: ExperienceClient,
  connectorId: string,
  socialUserId: string
) => {
  const state = 'state';
  const redirectUri = 'http://localhost:3000';
  const { verificationId } = await successfullyCreateSocialVerification(client, connectorId, {
    redirectUri,
    state,
  });
  await successfullyVerifySocialAuthorization(client, connectorId, {
    verificationId,
    connectorData: { state, redirectUri, code: 'fake_code', userId: socialUserId },
  });
  await client.identifyUser({ verificationId });
};
