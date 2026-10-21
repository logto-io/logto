/**
 * @fileoverview SignIn with requested ACR and passkeys: a user-verified passkey reaches `mfa`
 * alone, and when the sign-in still needs a first factor, the pinned-user chooser offers the
 * passkey first and the first-factor fallback behind it.
 */
import { ConnectorType } from '@logto/connector-kit';
import { MfaFactor, MfaPolicy, VerificationType } from '@logto/schemas';
import { assertEnv } from '@silverhand/essentials';
import { createInterceptorsPreset, createPool, type DatabasePool } from '@silverhand/slonik';
import { authenticator } from 'otplib';

import { updateUserLogtoConfig } from '#src/api/admin-user.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { logoutClient } from '#src/helpers/client.js';
import { clearConnectorsByTypes, setSocialConnector } from '#src/helpers/connector.js';
import {
  createTotp,
  enrollPasskey,
  expectAuthenticationContext,
  finishSignIn,
  identifyWithPasskey,
  identifyWithSocial,
  initSignInWithAcr,
  linkSocialIdentity,
  mfaAcr,
  nowInSeconds,
  verifyWebAuthnAuthentication,
} from '#src/helpers/experience/sign-in-with-acr.js';
import { successfullyVerifyTotp } from '#src/helpers/experience/totp-verification.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  enableAllPasswordSignInMethods,
  resetMfaSettings,
  resetPasskeySignInSettings,
} from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';
import { devFeatureTest } from '#src/utils.js';

devFeatureTest.describe('sign-in with requested ACR and passkeys', () => {
  const userApi = new UserApiTest();
  // eslint-disable-next-line @silverhand/fp/no-let -- Initialized in `beforeAll`.
  let pool: DatabasePool;
  // eslint-disable-next-line @silverhand/fp/no-let -- Initialized in `beforeAll`.
  let connectorId = '';

  /** A user with a password, an enrolled TOTP and a passkey, who skips the tenant's MFA prompt. */
  const createUser = async () => {
    const profile = generateNewUserProfile({ username: true, password: true });
    const { id } = await userApi.create(profile);
    const secret = await createTotp(id);
    const passkey = await enrollPasskey(pool, id);
    await updateUserLogtoConfig(id, { mfa: { skipMfaOnSignIn: true }, passkeySignIn: {} });

    return { ...profile, id, secret, passkey };
  };

  /**
   * A social sign-in identifies the user without a first factor, which sends a sign-in to the
   * pinned-user chooser. The passkey, which reaches `mfa` alone, is offered first and the
   * first-factor fallback behind it, both in the error and in the interaction the page reads.
   */
  const signInToChooser = async () => {
    const user = await createUser();
    const socialUserId = await linkSocialIdentity(user.id, connectorId);

    const client = await initSignInWithAcr(mfaAcr);
    await identifyWithSocial(client, connectorId, socialUserId);

    const offered = [VerificationType.WebAuthn, VerificationType.Password];
    await expectRejects(client.submitInteraction(), {
      code: 'session.step_up.require_verification',
      status: 403,
      expectData: (data: { availableMethods: VerificationType[] }) => {
        expect(data.availableMethods).toEqual(offered);
      },
    });
    const { authenticationContext } = await client.getInteractionData();
    expect(authenticationContext?.availableMethods).toEqual(offered);

    return { client, user };
  };

  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await updateSignInExperience({
      adaptiveMfa: { enabled: false },
      mfa: { factors: [MfaFactor.TOTP, MfaFactor.WebAuthn], policy: MfaPolicy.NoPrompt },
      passkeySignIn: { enabled: true, showPasskeyButton: true, allowAutofill: false },
    });
    await clearConnectorsByTypes([ConnectorType.Social]);
    // eslint-disable-next-line @silverhand/fp/no-mutation
    ({ id: connectorId } = await setSocialConnector());
    // eslint-disable-next-line @silverhand/fp/no-mutation
    pool = await createPool(assertEnv('DB_URL'), { interceptors: createInterceptorsPreset() });
  });

  afterAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Social]);
    await resetPasskeySignInSettings();
    await resetMfaSettings();
    await userApi.cleanUp();
    await pool.end();
  });

  it('satisfies mfa with a passkey sign-in without a second challenge', async () => {
    const { id, username, passkey } = await createUser();
    const issuedAt = nowInSeconds();

    const client = await initSignInWithAcr(mfaAcr);
    await identifyWithPasskey(client, username, (challenge) => passkey.assert(challenge));

    // The enrolled TOTP is not asked for: the user-verified passkey reaches `mfa` alone.
    expectAuthenticationContext(
      await finishSignIn(client),
      { sub: id, acr: mfaAcr, amr: ['pop', 'user', 'mfa'] },
      issuedAt
    );

    await logoutClient(client);
  });

  describe('the pinned-user chooser after a social sign-in', () => {
    it('finishes the sign-in with the passkey', async () => {
      const { client, user } = await signInToChooser();

      await verifyWebAuthnAuthentication(client, (challenge) => user.passkey.assert(challenge));

      expect(await finishSignIn(client)).toMatchObject({
        sub: user.id,
        acr: mfaAcr,
        amr: ['fed', 'pop', 'user', 'mfa'],
      });

      await logoutClient(client);
    });

    it('finishes the sign-in with the first-factor fallback and the TOTP', async () => {
      const { client, user } = await signInToChooser();

      // The pinned-user password variant: no identifier, the server resolves the subject.
      const { verificationId } = await client.verifyPassword({ password: user.password });
      await client.identifyUser({ verificationId });

      // With the first factor proven, the existing MFA verification error finishes the pair.
      await expectRejects(client.submitInteraction(), {
        code: 'session.mfa.require_mfa_verification',
        status: 403,
        expectData: (data: { availableFactors: MfaFactor[] }) => {
          expect(data.availableFactors).toEqual([MfaFactor.WebAuthn, MfaFactor.TOTP]);
        },
      });
      await successfullyVerifyTotp(client, { code: authenticator.generate(user.secret) });

      expect(await finishSignIn(client)).toMatchObject({
        sub: user.id,
        acr: mfaAcr,
        amr: ['fed', 'pwd', 'otp', 'mfa'],
      });

      await logoutClient(client);
    });
  });
});
