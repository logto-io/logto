/**
 * @fileoverview Pure step-up submission: the allow-list completion path, its audit entry, and the
 * token claims it produces, asserted end to end through a real Authorization Code Flow on a
 * developer-created application.
 *
 * SignIn with requested ACR is a different path (its requested class is a completion requirement of
 * `submit()`), and establishing or enrolling a missing method inside step-up is a later milestone;
 * neither is covered here.
 */
import { TemplateType } from '@logto/connector-kit';
import { Prompt } from '@logto/node';
import {
  ApplicationType,
  ConnectorType,
  InteractionEvent,
  MfaFactor,
  SignInIdentifier,
  VerificationType,
  type Application,
} from '@logto/schemas';
import { authenticator } from 'otplib';

import { createUserMfaVerification, getUser, updateUserLogtoConfig } from '#src/api/admin-user.js';
import { createApplication, deleteApplication } from '#src/api/application.js';
import { getAuditLogs } from '#src/api/logs.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { type ExperienceClient } from '#src/client/experience/index.js';
import { initExperienceClient } from '#src/helpers/client.js';
import { clearConnectorsByTypes, setEmailConnector } from '#src/helpers/connector.js';
import { authorizeWithSession } from '#src/helpers/experience/authorization.js';
import { successfullyVerifyTotp } from '#src/helpers/experience/totp-verification.js';
import { expectRejects, readConnectorMessage } from '#src/helpers/index.js';
import {
  enableAllPasswordSignInMethods,
  enableMandatoryMfaWithTotp,
  enableUserControlledMfaWithNoPrompt,
  resetMfaSettings,
} from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';
import { devFeatureTest, generateTestName } from '#src/utils.js';

const firstFactorAcr = 'urn:logto:acr:1fa';
const mfaAcr = 'urn:logto:acr:mfa';
const redirectUri = 'https://step-up.example.com/callback';
const stepUpLogKey = 'Interaction.SignIn.StepUp.Submit';

/**
 * Submit the step-up and exchange the authorization code it hands back. The resumed authorization
 * either goes straight to the client callback or asks for consent once more, depending on whether
 * the request forced reauthentication.
 */
const submitStepUp = async (client: ExperienceClient) => {
  const { redirectTo } = await client.submitInteraction();
  await client.resumeAuthorization(redirectTo);

  return client.getIdTokenClaims();
};

/** Start a step-up authorization on the signed-in client and land on the step-up path. */
const startStepUp = async (
  client: ExperienceClient,
  { acrValues, maxAge, prompt }: { acrValues: string; maxAge?: string; prompt?: Prompt }
) => {
  const { status, location } = await authorizeWithSession(
    client,
    {
      ...(prompt ? { prompt } : {}),
      extraParams: {
        acr_values: acrValues,
        ...(maxAge === undefined ? {} : { max_age: maxAge }),
      },
    },
    redirectUri
  );

  expect(status).toBe(303);
  expect(location.startsWith('/step-up')).toBe(true);
  await expect(
    client.initInteraction({ interactionEvent: InteractionEvent.SignIn })
  ).resolves.toBeUndefined();
};

devFeatureTest.describe('pure step-up submission', () => {
  const userApi = new UserApiTest();
  /** A password user with a primary email and no enrolled factor. */
  const passwordUser = generateNewUserProfile({
    username: true,
    password: true,
    primaryEmail: true,
  });

  // eslint-disable-next-line @silverhand/fp/no-let -- Assigned by the fixtures.
  let application: Application;
  // eslint-disable-next-line @silverhand/fp/no-let
  let passwordUserId = '';

  const createClient = async () =>
    initExperienceClient({
      config: { appId: application.id, scopes: [] },
      redirectUri,
    });

  /**
   * A fresh user with a password and an enrolled TOTP factor. TOTP codes are single-use per time
   * step, so every test that verifies one enrolls its own account instead of sharing a secret.
   */
  const createTotpUser = async () => {
    const profile = generateNewUserProfile({ username: true, password: true, primaryEmail: true });
    const user = await userApi.create(profile);
    const totp = await createUserMfaVerification(user.id, MfaFactor.TOTP);

    if (totp.type !== MfaFactor.TOTP) {
      throw new Error('unexpected MFA factor type');
    }

    // Let the password sign-in establish the session without a TOTP challenge. A requested `mfa`
    // in the step-up ignores this preference, so the factor still has to be verified there.
    await updateUserLogtoConfig(user.id, {
      mfa: { skipMfaOnSignIn: true },
      passkeySignIn: {},
    });

    return { profile, id: user.id, code: authenticator.generate(totp.secret) };
  };

  /** Sign in with the password through the created application, leaving an OIDC session behind. */
  const signInWithPassword = async ({ username, password }: typeof passwordUser) => {
    const client = await createClient();
    const { verificationId } = await client.verifyPassword({
      identifier: { type: SignInIdentifier.Username, value: username },
      password,
    });
    await client.identifyUser({ verificationId });

    const { redirectTo } = await client.submitInteraction();
    await client.processSession(redirectTo);

    return client;
  };

  const verifyPassword = async (client: ExperienceClient, { password }: typeof passwordUser) => {
    const { verificationId } = await client.verifyPassword({ password });
    await client.identifyUser({ verificationId });
  };

  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await updateSignInExperience({ adaptiveMfa: { enabled: false } });
    // TOTP enabled without an enrollment prompt, so a user without a factor can still sign in and a
    // requested `mfa` is what asks for the factor.
    await enableUserControlledMfaWithNoPrompt();
    await clearConnectorsByTypes([ConnectorType.Email]);
    await setEmailConnector();

    const [createdPasswordUser, createdApplication] = await Promise.all([
      userApi.create(passwordUser),
      createApplication(generateTestName(), ApplicationType.SPA, {
        oidcClientMetadata: { redirectUris: [redirectUri], postLogoutRedirectUris: [] },
      }),
    ]);
    // eslint-disable-next-line @silverhand/fp/no-mutation
    passwordUserId = createdPasswordUser.id;
    // eslint-disable-next-line @silverhand/fp/no-mutation
    application = createdApplication;
  });

  afterAll(async () => {
    await resetMfaSettings();
    await clearConnectorsByTypes([ConnectorType.Email]);
    await Promise.all([userApi.cleanUp(), deleteApplication(application.id)]);
  });

  it('reaches 1fa through the pinned password without running a sign-in', async () => {
    const client = await signInWithPassword(passwordUser);
    const { lastSignInAt } = await getUser(passwordUserId);
    const issuedAt = Math.floor(Date.now() / 1000);

    await startStepUp(client, { acrValues: firstFactorAcr, prompt: Prompt.Login });

    const { authenticationContext } = await client.getInteractionData();
    expect(authenticationContext).toMatchObject({
      mode: 'stepUp',
      requestedAcrValues: [firstFactorAcr],
      selectedAcr: firstFactorAcr,
    });
    expect(authenticationContext?.availableMethods).toEqual([
      VerificationType.Password,
      VerificationType.EmailVerificationCode,
    ]);

    await verifyPassword(client, passwordUser);
    const claims = await submitStepUp(client);

    expect(claims).toMatchObject({ sub: passwordUserId, acr: firstFactorAcr, amr: ['pwd'] });
    expect(claims.auth_time).toBeGreaterThanOrEqual(issuedAt);
    // A step-up is not a sign-in: no `lastSignInAt` write, no post-sign-in side effect.
    const { lastSignInAt: afterStepUp } = await getUser(passwordUserId);
    expect(afterStepUp).toBe(lastSignInAt);
  });

  it('reaches 1fa through the pinned primary email code and reports only its own amr', async () => {
    const client = await signInWithPassword(passwordUser);
    await startStepUp(client, { acrValues: firstFactorAcr, prompt: Prompt.Login });

    const { verificationId } = await client.sendVerificationCode({
      identifier: { type: SignInIdentifier.Email },
      interactionEvent: InteractionEvent.SignIn,
    });
    const { code, address, type } = await readConnectorMessage('Email');

    expect(address).toBe(passwordUser.primaryEmail);
    expect(type).toBe(TemplateType.SignIn);

    await client.verifyVerificationCode({
      identifier: { type: SignInIdentifier.Email },
      verificationId,
      code,
    });
    await client.identifyUser({ verificationId });

    const claims = await submitStepUp(client);

    // The password session only carried the context in; `amr` describes this interaction alone.
    expect(claims).toMatchObject({ sub: passwordUserId, acr: firstFactorAcr, amr: ['otp'] });
  });

  it('reaches mfa by verifying only the enrolled factor on a 1fa session', async () => {
    const { profile, id, code } = await createTotpUser();
    const client = await signInWithPassword(profile);
    await startStepUp(client, { acrValues: mfaAcr });

    const { authenticationContext } = await client.getInteractionData();
    expect(authenticationContext).toMatchObject({
      selectedAcr: mfaAcr,
      // The session's `1fa` skips the first-factor prompt for a user with a factor to verify.
      availableMethods: [VerificationType.TOTP],
    });

    await successfullyVerifyTotp(client, { code });
    const claims = await submitStepUp(client);

    expect(claims).toMatchObject({ sub: id, acr: mfaAcr, amr: ['otp', 'mfa'] });
  });

  it('rejects a submission that reaches only 1fa when mfa was selected, then completes it', async () => {
    const { profile, id, code } = await createTotpUser();
    const client = await signInWithPassword(profile);
    await startStepUp(client, { acrValues: mfaAcr });
    await verifyPassword(client, profile);

    // The UI only offers sufficient methods; a client that submits anyway writes no result.
    await expectRejects(client.submitInteraction(), {
      code: 'session.step_up.acr_not_satisfied',
      status: 403,
    });

    // The rejected submission leaves the interaction usable: the missing factor completes it.
    await successfullyVerifyTotp(client, { code });
    const claims = await submitStepUp(client);

    expect(claims).toMatchObject({ sub: id, acr: mfaAcr, amr: ['pwd', 'otp', 'mfa'] });
  });

  it('forces an active verification without forcing the password', async () => {
    const { profile, id, code } = await createTotpUser();
    const client = await signInWithPassword(profile);

    // The session already satisfies `1fa`; `max_age=0` is what demands a fresh verification, and it
    // does not demand a first factor: the enrolled factor alone completes the interaction.
    await startStepUp(client, { acrValues: firstFactorAcr, maxAge: '0' });
    await successfullyVerifyTotp(client, { code });
    const claims = await submitStepUp(client);

    // The achieved class may be stronger than the selected one: the factor pairs with the `1fa`
    // context the session carried in.
    expect(claims).toMatchObject({ sub: id, acr: mfaAcr, amr: ['otp', 'mfa'] });
  });

  it('replaces the session context instead of merging it', async () => {
    const { profile, id, code } = await createTotpUser();
    const client = await signInWithPassword(profile);
    await startStepUp(client, { acrValues: mfaAcr });
    await successfullyVerifyTotp(client, { code });

    const elevated = await submitStepUp(client);
    expect(elevated).toMatchObject({ acr: mfaAcr, amr: ['otp', 'mfa'] });

    // A later step-up that only re-verifies the password drops the previous MFA information.
    await startStepUp(client, { acrValues: firstFactorAcr, prompt: Prompt.Login });
    await verifyPassword(client, profile);
    const reauthenticated = await submitStepUp(client);

    expect(reauthenticated).toMatchObject({ sub: id, acr: firstFactorAcr, amr: ['pwd'] });
  });

  it('applies no tenant MFA policy', async () => {
    const { profile, id } = await createTotpUser();
    const client = await signInWithPassword(profile);
    await enableMandatoryMfaWithTotp();

    try {
      await startStepUp(client, { acrValues: firstFactorAcr, prompt: Prompt.Login });
      await verifyPassword(client, profile);

      // A mandatory MFA policy never reaches step-up; the requested class alone decides.
      const claims = await submitStepUp(client);
      expect(claims).toMatchObject({ sub: id, acr: firstFactorAcr, amr: ['pwd'] });
    } finally {
      await enableUserControlledMfaWithNoPrompt();
    }
  });

  it('recovers the same context when the client refetches mid-flow', async () => {
    const client = await signInWithPassword(passwordUser);
    await startStepUp(client, { acrValues: firstFactorAcr, prompt: Prompt.Login });
    const { verificationId } = await client.verifyPassword({ password: passwordUser.password });

    // A refresh is a plain refetch: the server-driven context and the verified record survive it.
    const refreshed = await client.getInteractionData();
    expect(refreshed.authenticationContext).toMatchObject({
      mode: 'stepUp',
      selectedAcr: firstFactorAcr,
    });
    expect(refreshed.verificationRecords).toEqual([
      expect.objectContaining({ id: verificationId, verified: true }),
    ]);
    expect(refreshed.userId).toBeUndefined();

    await client.identifyUser({ verificationId });
    const claims = await submitStepUp(client);
    expect(claims).toMatchObject({ sub: passwordUserId, acr: firstFactorAcr, amr: ['pwd'] });
  });

  it('records successful and rejected submissions under the step-up audit key without secrets', async () => {
    const { profile } = await createTotpUser();
    const rejectedClient = await signInWithPassword(profile);
    await startStepUp(rejectedClient, { acrValues: mfaAcr });
    await verifyPassword(rejectedClient, profile);
    await expectRejects(rejectedClient.submitInteraction(), {
      code: 'session.step_up.acr_not_satisfied',
      status: 403,
    });

    const acceptedClient = await signInWithPassword(passwordUser);
    await startStepUp(acceptedClient, { acrValues: firstFactorAcr, prompt: Prompt.Login });
    const { verificationId } = await acceptedClient.verifyPassword({
      password: passwordUser.password,
    });
    await acceptedClient.identifyUser({ verificationId });
    await submitStepUp(acceptedClient);

    const logs = await getAuditLogs(
      new URLSearchParams({ logKey: stepUpLogKey, applicationId: application.id })
    );
    const accepted = logs.find(({ payload }) => payload.result === 'Success');
    const rejected = logs.find(({ payload }) => payload.result === 'Error');

    expect(accepted?.payload).toMatchObject({
      key: stepUpLogKey,
      applicationId: application.id,
      requestedAcrValues: [firstFactorAcr],
      selectedAcr: firstFactorAcr,
      achievedAcr: firstFactorAcr,
      factors: ['password'],
    });
    expect(rejected?.payload).toMatchObject({
      key: stepUpLogKey,
      requestedAcrValues: [mfaAcr],
      selectedAcr: mfaAcr,
      achievedAcr: firstFactorAcr,
      factors: ['password'],
      error: { code: 'session.step_up.acr_not_satisfied' },
    });

    // Credentials never reach the log. The interaction snapshot the submit route appends carries
    // the verification record ids, which are not credentials.
    for (const log of [accepted, rejected]) {
      const serialized = JSON.stringify(log);
      expect(serialized).not.toContain(passwordUser.password);
      expect(serialized).not.toContain(profile.password);
    }
  });
});
