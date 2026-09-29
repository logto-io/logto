/**
 * @fileoverview SignIn with requested ACR: a sign-in without an OIDC session whose authorization
 * request carried `acr_values`. The requested class is one more completion requirement of the
 * sign-in, enforced the same error-driven way as tenant MFA, and the resulting tokens carry the
 * context the sign-in achieved. The passkey rows live in `sign-in-with-acr.passkey.test.ts`.
 */
import { ConnectorType } from '@logto/connector-kit';
import {
  InteractionEvent,
  InteractionHookEvent,
  MfaFactor,
  MfaPolicy,
  SignInIdentifier,
  VerificationType,
} from '@logto/schemas';
import { assert, assertEnv } from '@silverhand/essentials';
import { createInterceptorsPreset, createPool, type DatabasePool } from '@silverhand/slonik';
import { authenticator } from 'otplib';

import { getUser, updateUserLogtoConfig } from '#src/api/admin-user.js';
import { getWebhookRecentLogs } from '#src/api/logs.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { ExperienceClient } from '#src/client/experience/index.js';
import { initExperienceClient, logoutClient } from '#src/helpers/client.js';
import {
  clearConnectorsByTypes,
  setEmailConnector,
  setSocialConnector,
} from '#src/helpers/connector.js';
import { identifyUserWithUsernamePassword } from '#src/helpers/experience/index.js';
import {
  createTotp,
  expectAuthenticationContext,
  finishSignIn,
  firstFactorAcr,
  identifyWithSocial,
  initSignInWithAcr,
  linkSocialIdentity,
  mfaAcr,
  nowInSeconds,
  setTrustedDeviceOptInDecision,
  trustDevice,
} from '#src/helpers/experience/sign-in-with-acr.js';
import { successfullyVerifyTotp } from '#src/helpers/experience/totp-verification.js';
import { WebHookApiTest } from '#src/helpers/hook.js';
import { expectRejects, readConnectorMessage } from '#src/helpers/index.js';
import {
  enableAllPasswordSignInMethods,
  resetMfaSettings,
} from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';
import { devFeatureTest, waitFor } from '#src/utils.js';

import WebhookMockServer from '../hook/WebhookMockServer.js';

/** TOTP enabled without a sign-in prompt, so only the requested class asks for the factor. */
const userControlledMfa = {
  factors: [MfaFactor.TOTP],
  policy: MfaPolicy.NoPrompt,
};

const countPostSignInHooks = async (hookId: string, userId: string) => {
  await waitFor(500);
  const logs = await getWebhookRecentLogs(
    hookId,
    new URLSearchParams({
      logKey: `TriggerHook.${InteractionHookEvent.PostSignIn}`,
      page_size: '20',
    })
  );

  return logs.filter(({ payload }) => JSON.stringify(payload).includes(userId)).length;
};

devFeatureTest.describe('sign-in with requested ACR', () => {
  const userApi = new UserApiTest();
  // eslint-disable-next-line @silverhand/fp/no-let -- Initialized in `beforeAll`.
  let pool: DatabasePool;

  /** A password user with an enrolled TOTP who skips the tenant's MFA prompt on sign-in. */
  const createTotpUser = async () => {
    const profile = generateNewUserProfile({ username: true, password: true });
    const { id } = await userApi.create(profile);
    const secret = await createTotp(id);
    await updateUserLogtoConfig(id, { mfa: { skipMfaOnSignIn: true }, passkeySignIn: {} });

    return { ...profile, id, secret };
  };

  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await updateSignInExperience({ adaptiveMfa: { enabled: false }, mfa: userControlledMfa });
    // eslint-disable-next-line @silverhand/fp/no-mutation
    pool = await createPool(assertEnv('DB_URL'), { interceptors: createInterceptorsPreset() });
  });

  afterAll(async () => {
    await resetMfaSettings();
    await userApi.cleanUp();
    await pool.end();
  });

  describe('trusted device', () => {
    beforeAll(async () => {
      await updateSignInExperience({ trustedDevice: { enabled: true, durationDays: 30 } });
    });

    afterAll(async () => {
      await updateSignInExperience({ trustedDevice: { enabled: false } });
    });

    it('asks a password sign-in for the enrolled TOTP when mfa is requested on a trusted device', async () => {
      const user = await createTotpUser();
      const issuedAt = nowInSeconds();

      // The trusted device fulfills the tenant's policy: a plain sign-in skips MFA.
      const plain = await initExperienceClient();
      await trustDevice(pool, plain, user.id);
      await identifyUserWithUsernamePassword(plain, user.username, user.password);
      expect(await finishSignIn(plain)).toMatchObject({ acr: firstFactorAcr, amr: ['pwd'] });
      await logoutClient(plain);

      // A requested `mfa` ignores it; the existing MFA verification error drives the flow.
      const client = await initSignInWithAcr(mfaAcr);
      await trustDevice(pool, client, user.id);
      await identifyUserWithUsernamePassword(client, user.username, user.password);
      await expectRejects(client.submitInteraction(), {
        code: 'session.mfa.require_mfa_verification',
        status: 403,
        expectData: (data: { availableFactors: MfaFactor[] }) => {
          expect(data.availableFactors).toEqual([MfaFactor.TOTP]);
        },
      });
      await successfullyVerifyTotp(client, { code: authenticator.generate(user.secret) });

      // The fresh TOTP is an eligible trusted-device proof, so the tenant's policy offers to trust
      // this device again; answering it is unrelated to the requested class.
      await expectRejects(client.submitInteraction(), {
        code: 'session.trusted_device_suggest_opt_in',
        status: 422,
      });
      await setTrustedDeviceOptInDecision(client, false);

      expectAuthenticationContext(
        await finishSignIn(client),
        { sub: user.id, acr: mfaAcr, amr: ['pwd', 'otp', 'mfa'] },
        issuedAt
      );

      await logoutClient(client);
    });
  });

  describe('social sign-in', () => {
    // eslint-disable-next-line @silverhand/fp/no-let -- Initialized in `beforeAll`.
    let connectorId = '';

    beforeAll(async () => {
      await clearConnectorsByTypes([ConnectorType.Social, ConnectorType.Email]);
      await setEmailConnector();
      // eslint-disable-next-line @silverhand/fp/no-mutation
      ({ id: connectorId } = await setSocialConnector());
    });

    afterAll(async () => {
      await clearConnectorsByTypes([ConnectorType.Social, ConnectorType.Email]);
    });

    it('asks for the primary email code on the pinned-user page when 1fa is requested', async () => {
      const { primaryEmail } = generateNewUserProfile({ primaryEmail: true });
      const { id: userId } = await userApi.create({ primaryEmail });
      const socialUserId = await linkSocialIdentity(userId, connectorId);
      const issuedAt = nowInSeconds();

      const client = await initSignInWithAcr(firstFactorAcr);
      await identifyWithSocial(client, connectorId, socialUserId);

      // The social sign-in proves no Logto-verifiable first factor, so the submission asks for
      // one. The error is only a navigation signal: it carries no raw identifier.
      await expectRejects(client.submitInteraction(), {
        code: 'session.step_up.require_verification',
        status: 403,
        expectData: (data: Record<string, unknown>) => {
          expect(data).toEqual({
            selectedAcr: firstFactorAcr,
            availableMethods: [VerificationType.EmailVerificationCode],
            maskedIdentifiers: { email: expect.stringContaining('****') as unknown },
          });
          expect(JSON.stringify(data)).not.toContain(primaryEmail);
        },
      });

      // The pinned-user page reads the same state from the interaction.
      const { authenticationContext } = await client.getInteractionData();
      expect(authenticationContext).toMatchObject({
        requestedAcrValues: [firstFactorAcr],
        availableMethods: [VerificationType.EmailVerificationCode],
      });

      // The pinned-user variant sends only the identifier type; the server resolves the address.
      const { verificationId } = await client.sendVerificationCode({
        identifier: { type: SignInIdentifier.Email },
        interactionEvent: InteractionEvent.SignIn,
      });
      const { code, address } = await readConnectorMessage('Email');
      expect(address).toBe(primaryEmail);
      await client.verifyVerificationCode({
        identifier: { type: SignInIdentifier.Email },
        verificationId,
        code,
      });
      await client.identifyUser({ verificationId });

      expectAuthenticationContext(
        await finishSignIn(client),
        { sub: userId, acr: firstFactorAcr, amr: ['fed', 'otp'] },
        issuedAt
      );

      await logoutClient(client);
    });
  });

  it('completes a password sign-in requesting [mfa, 1fa] immediately', async () => {
    // The enrolled TOTP is never consulted to select the class: `1fa` is already satisfied.
    const user = await createTotpUser();
    const issuedAt = nowInSeconds();

    const client = await initSignInWithAcr(`${mfaAcr} ${firstFactorAcr}`);
    await identifyUserWithUsernamePassword(client, user.username, user.password);

    expectAuthenticationContext(
      await finishSignIn(client),
      { sub: user.id, acr: firstFactorAcr, amr: ['pwd'] },
      issuedAt
    );

    await logoutClient(client);
  });

  it('shares one TOTP verification between the tenant MFA policy and the requested mfa', async () => {
    await updateSignInExperience({
      mfa: { factors: [MfaFactor.TOTP], policy: MfaPolicy.Mandatory },
    });

    try {
      const profile = generateNewUserProfile({ username: true, password: true });
      const { id } = await userApi.create(profile);
      const secret = await createTotp(id);

      const client = await initSignInWithAcr(mfaAcr);
      await identifyUserWithUsernamePassword(client, profile.username, profile.password);
      await expectRejects(client.submitInteraction(), {
        code: 'session.mfa.require_mfa_verification',
        status: 403,
      });
      await successfullyVerifyTotp(client, { code: authenticator.generate(secret) });

      // The single TOTP fulfills both: the next submission asks for nothing else.
      expect(await finishSignIn(client)).toMatchObject({
        sub: id,
        acr: mfaAcr,
        amr: ['pwd', 'otp', 'mfa'],
      });

      await logoutClient(client);
    } finally {
      await updateSignInExperience({ mfa: userControlledMfa });
    }
  });

  it('restores the requested context after a refresh mid-assurance', async () => {
    const user = await createTotpUser();

    const client = await initSignInWithAcr(mfaAcr);
    await identifyUserWithUsernamePassword(client, user.username, user.password);
    await expectRejects(client.submitInteraction(), {
      code: 'session.mfa.require_mfa_verification',
      status: 403,
    });

    // A refresh keeps only the cookies: the state is read back from the interaction, not from the
    // navigation state the error handler left behind.
    const refreshed = new ExperienceClient();
    refreshed.mergeRawCookies(client.rawCookies);
    const { userId, authenticationContext } = await refreshed.getInteractionData();

    expect(userId).toBe(user.id);
    expect(authenticationContext).toMatchObject({
      requestedAcrValues: [mfaAcr],
      availableMethods: [VerificationType.TOTP],
    });

    // The page continues on the same interaction: the requirement is re-derived from scratch. The
    // original client finishes, since it holds the relying party's authorization-request state.
    await successfullyVerifyTotp(refreshed, { code: authenticator.generate(user.secret) });
    expect(await finishSignIn(client)).toMatchObject({
      sub: user.id,
      acr: mfaAcr,
      amr: ['pwd', 'otp', 'mfa'],
    });

    await logoutClient(client);
  });

  describe('sign-in side effects', () => {
    const webHookMockServer = new WebhookMockServer(9997);
    const webHookApi = new WebHookApiTest();
    const hookName = 'signInWithAcrPostSignIn';

    beforeAll(async () => {
      await webHookMockServer.listen();
      await webHookApi.create({
        name: hookName,
        events: [InteractionHookEvent.PostSignIn],
        config: { url: webHookMockServer.endpoint },
      });
    });

    afterAll(async () => {
      await webHookApi.cleanUp();
      await webHookMockServer.close();
    });

    it('run exactly once, after the submission that satisfies the requested class', async () => {
      const hook = webHookApi.hooks.get(hookName);
      assert(hook, new Error('The hook was not created'));
      const user = await createTotpUser();
      const { lastSignInAt: beforeSignIn } = await getUser(user.id);

      const client = await initSignInWithAcr(mfaAcr);
      await identifyUserWithUsernamePassword(client, user.username, user.password);

      // Rejected submissions leave nothing behind, however often they are retried.
      for (const _ of [1, 2]) {
        // eslint-disable-next-line no-await-in-loop -- Submissions are sequential by design.
        await expectRejects(client.submitInteraction(), {
          code: 'session.mfa.require_mfa_verification',
          status: 403,
        });
      }

      const { lastSignInAt: afterRejections } = await getUser(user.id);
      expect(afterRejections).toBe(beforeSignIn);
      expect(await countPostSignInHooks(hook.id, user.id)).toBe(0);

      await successfullyVerifyTotp(client, { code: authenticator.generate(user.secret) });
      // Let the clock pass a second, so `auth_time` tells the final submission from the first.
      await waitFor(1100);
      const finalSubmissionAt = nowInSeconds();
      const claims = await finishSignIn(client);

      const { lastSignInAt } = await getUser(user.id);
      expect(lastSignInAt).not.toBe(beforeSignIn);
      expect(await countPostSignInHooks(hook.id, user.id)).toBe(1);
      expectAuthenticationContext(
        claims,
        { sub: user.id, acr: mfaAcr, amr: ['pwd', 'otp', 'mfa'] },
        finalSubmissionAt
      );

      await logoutClient(client);
    });
  });
});
