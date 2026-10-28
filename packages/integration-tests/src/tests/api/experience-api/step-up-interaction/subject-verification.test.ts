import { TemplateType } from '@logto/connector-kit';
import { Prompt } from '@logto/node';
import {
  AdditionalIdentifier,
  ConnectorType,
  InteractionEvent,
  MfaPolicy,
  SignInIdentifier,
  SignInMode,
  VerificationType,
  type SignInExperience,
} from '@logto/schemas';
import { generateStandardId, maskEmail } from '@logto/shared';
import { type Optional } from '@silverhand/essentials';

import { getUser, getUsers } from '#src/api/admin-user.js';
import { getSignInExperience, updateSignInExperience } from '#src/api/sign-in-experience.js';
import { type ExperienceClient } from '#src/client/experience/index.js';
import { initExperienceClient, logoutClient, processSession } from '#src/helpers/client.js';
import {
  clearConnectorsByTypes,
  setEmailConnector,
  setSocialConnector,
} from '#src/helpers/connector.js';
import { authorizeWithSession } from '#src/helpers/experience/authorization.js';
import { identifyUserWithUsernamePassword } from '#src/helpers/experience/index.js';
import {
  finishSignIn,
  identifyWithSocial,
  linkSocialIdentity,
} from '#src/helpers/experience/sign-in-with-acr.js';
import {
  successfullyCreateSocialVerification,
  successfullyVerifySocialAuthorization,
} from '#src/helpers/experience/social-verification.js';
import { expectRejects, readConnectorMessage } from '#src/helpers/index.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';
import { devFeatureTest, generatePassword, generateUsername } from '#src/utils.js';

const firstFactorAcr = 'urn:logto:acr:1fa';

/** Force a `1fa` step-up on the signed-in client, so every method of the pinned user is offered. */
const startStepUp = async (client: ExperienceClient) => {
  const { status, location } = await authorizeWithSession(client, {
    prompt: Prompt.Login,
    extraParams: { acr_values: firstFactorAcr },
  });

  expect(status).toBe(303);
  expect(location.startsWith('/step-up')).toBe(true);

  await expect(
    client.initInteraction({ interactionEvent: InteractionEvent.SignIn })
  ).resolves.toBeUndefined();
};

/** Sign in with the password so the session carries `acr=urn:logto:acr:1fa`. */
const signInWithPassword = async ({
  username,
  password,
}: {
  username: string;
  password: string;
}) => {
  const client = await initExperienceClient();
  await identifyUserWithUsernamePassword(client, username, password);
  const { redirectTo } = await client.submitInteraction();
  await processSession(client, redirectTo);

  return client;
};

devFeatureTest.describe('step-up subject-bound verification', () => {
  const userApi = new UserApiTest();
  const user = generateNewUserProfile({ username: true, password: true, primaryEmail: true });
  // eslint-disable-next-line @silverhand/fp/no-let -- Assigned once the fixture is created.
  let userId = '';

  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await updateSignInExperience({ adaptiveMfa: { enabled: false } });
    await clearConnectorsByTypes([ConnectorType.Email]);
    await setEmailConnector();

    const created = await userApi.create(user);
    // eslint-disable-next-line @silverhand/fp/no-mutation
    userId = created.id;
  });

  afterAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email]);
    await userApi.cleanUp();
  });

  it('verifies the pinned user password without an identifier and reaches 1fa', async () => {
    const client = await signInWithPassword(user);
    await startStepUp(client);

    const { verificationId } = await client.verifyPassword({ password: user.password });

    const data = await client.getInteractionData();
    expect(data.userId).toBeUndefined();
    expect(data.verificationRecords).toEqual([
      expect.objectContaining({
        id: verificationId,
        type: VerificationType.Password,
        verified: true,
        identifier: { type: AdditionalIdentifier.UserId, value: userId },
      }),
    ]);
    expect(JSON.stringify(data)).not.toContain(user.username);
    expect(JSON.stringify(data)).not.toContain(user.primaryEmail);

    await client.identifyUser({ verificationId });
    const { userId: identifiedUserId } = await client.getInteractionData();
    expect(identifiedUserId).toBe(userId);

    const { redirectTo } = await client.submitInteraction();
    // The existing grant skips consent when the step-up resumes authorization.
    await client.manualConsent(redirectTo);
    expect(await client.getIdTokenClaims()).toMatchObject({
      sub: userId,
      acr: firstFactorAcr,
      amr: ['pwd'],
    });

    await logoutClient(client);
  });

  it('sends the code to the pinned user primary email without an identifier and reaches 1fa', async () => {
    const client = await signInWithPassword(user);
    await startStepUp(client);

    const { verificationId } = await client.sendVerificationCode({
      identifier: { type: SignInIdentifier.Email },
      interactionEvent: InteractionEvent.SignIn,
    });
    const { code, address, type } = await readConnectorMessage('Email');

    expect(address).toBe(user.primaryEmail);
    expect(type).toBe(TemplateType.SignIn);

    const data = await client.getInteractionData();
    expect(data.verificationRecords).toEqual([
      expect.objectContaining({
        id: verificationId,
        type: VerificationType.EmailVerificationCode,
        verified: false,
        userId,
        identifier: { type: SignInIdentifier.Email, value: maskEmail(user.primaryEmail) },
      }),
    ]);
    expect(JSON.stringify(data)).not.toContain(user.primaryEmail);

    await client.verifyVerificationCode({
      identifier: { type: SignInIdentifier.Email },
      verificationId,
      code,
    });
    await client.identifyUser({ verificationId });
    const { userId: identifiedUserId } = await client.getInteractionData();
    expect(identifiedUserId).toBe(userId);

    const { redirectTo } = await client.submitInteraction();
    // The existing grant skips consent when the step-up resumes authorization.
    await client.manualConsent(redirectTo);
    expect(await client.getIdTokenClaims()).toMatchObject({
      sub: userId,
      acr: firstFactorAcr,
      amr: ['otp'],
    });

    await logoutClient(client);
  });

  it('rejects the identifier-less payloads before the interaction carries a subject', async () => {
    const client = await initExperienceClient();

    await expectRejects(client.verifyPassword({ password: user.password }), {
      code: 'session.identifier_not_found',
      status: 404,
    });
    await expectRejects(
      client.sendVerificationCode({
        identifier: { type: SignInIdentifier.Email },
        interactionEvent: InteractionEvent.SignIn,
      }),
      { code: 'session.identifier_not_found', status: 404 }
    );
    await expectRejects(
      client.verifyVerificationCode({
        identifier: { type: SignInIdentifier.Email },
        verificationId: 'unknown',
        code: '000000',
      }),
      { code: 'session.identifier_not_found', status: 404 }
    );
    // The subject-bound code is a sign-in first factor only.
    await expectRejects(
      client.sendVerificationCode({
        identifier: { type: SignInIdentifier.Email },
        interactionEvent: InteractionEvent.Register,
      }),
      { code: 'guard.invalid_input', status: 400 }
    );
  });

  it('rejects raw identifier payloads in pure step-up', async () => {
    const client = await signInWithPassword(user);
    await startStepUp(client);

    await expectRejects(
      client.verifyPassword({
        identifier: { type: SignInIdentifier.Username, value: user.username },
        password: user.password,
      }),
      { code: 'session.step_up.forbidden_identifier', status: 403 }
    );
    await expectRejects(
      client.sendVerificationCode({
        identifier: { type: SignInIdentifier.Email, value: user.primaryEmail },
        interactionEvent: InteractionEvent.SignIn,
      }),
      { code: 'session.step_up.forbidden_identifier', status: 403 }
    );
    await expectRejects(
      client.verifyVerificationCode({
        identifier: { type: SignInIdentifier.Email, value: user.primaryEmail },
        verificationId: 'unknown',
        code: '000000',
      }),
      { code: 'session.step_up.forbidden_identifier', status: 403 }
    );

    await logoutClient(client);
  });

  describe('sentinel lockout', () => {
    // eslint-disable-next-line @silverhand/fp/no-let
    let originalSentinelPolicy: Optional<SignInExperience['sentinelPolicy']>;

    beforeAll(async () => {
      const signInExperience = await getSignInExperience();
      // eslint-disable-next-line @silverhand/fp/no-mutation
      originalSentinelPolicy = signInExperience.sentinelPolicy;
      await updateSignInExperience({ sentinelPolicy: { maxAttempts: 3, lockoutDuration: 10 } });
    });

    afterAll(async () => {
      // `sentinelPolicy` is tenant-wide; restore it so unrelated suites do not hit spurious lockouts.
      await updateSignInExperience({ sentinelPolicy: originalSentinelPolicy ?? {} });
    });

    it('counts failed subject-bound password attempts against the sign-in budget of the account', async () => {
      const lockedUser = generateNewUserProfile({ username: true, password: true });
      await userApi.create(lockedUser);

      const client = await signInWithPassword(lockedUser);
      await startStepUp(client);

      for (const _ of [1, 2]) {
        // eslint-disable-next-line no-await-in-loop
        await expectRejects(client.verifyPassword({ password: 'wrong password' }), {
          code: 'session.invalid_credentials',
          status: 422,
        });
      }

      await expectRejects(client.verifyPassword({ password: 'wrong password' }), {
        code: 'session.verification_blocked_too_many_attempts',
        status: 400,
      });

      // The lockout is shared with a sign-in of the same account
      const signInClient = await initExperienceClient();
      await expectRejects(
        signInClient.verifyPassword({
          identifier: { type: SignInIdentifier.Username, value: lockedUser.username },
          password: lockedUser.password,
        }),
        { code: 'session.verification_blocked_too_many_attempts', status: 400 }
      );

      await logoutClient(client);
    });
  });
});

devFeatureTest.describe('step-up social subject proof', () => {
  const userApi = new UserApiTest();
  // eslint-disable-next-line @silverhand/fp/no-let -- Assigned by the fixture.
  let connectorId: string;
  // eslint-disable-next-line @silverhand/fp/no-let -- Assigned by the fixture.
  let userId: string;
  // eslint-disable-next-line @silverhand/fp/no-let -- Assigned by the fixture.
  let socialUserId: string;
  // eslint-disable-next-line @silverhand/fp/no-let -- Assigned by the fixture.
  let client: ExperienceClient;

  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await clearConnectorsByTypes([ConnectorType.Social]);
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Assigned by the fixture.
    ({ id: connectorId } = await setSocialConnector());
    // Install the connector first: the sign-in experience PATCH drops targets without an
    // installed connector, and deleting a social connector removes its target.
    await updateSignInExperience({
      signInMode: SignInMode.SignIn,
      socialSignInConnectorTargets: ['mock-social'],
      mfa: { factors: [], policy: MfaPolicy.UserControlled },
    });

    // A username keeps the shared sign-up configuration from prompting for one; it is not a
    // verification method, so the user still has nothing to satisfy the step-up with.
    const user = await userApi.create({ username: generateUsername() });
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Assigned by the fixture.
    userId = user.id;
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Assigned by the fixture.
    socialUserId = await linkSocialIdentity(userId, connectorId);

    // Sign in with the linked identity to establish the session the step-up pins.
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Assigned by the fixture.
    client = await initExperienceClient();
    await identifyWithSocial(client, connectorId, socialUserId);
    await finishSignIn(client);
    await startStepUp(client);
  });

  afterAll(async () => {
    await logoutClient(client);
    await updateSignInExperience({ socialSignInConnectorTargets: [] });
    await clearConnectorsByTypes([ConnectorType.Social]);
    await enableAllPasswordSignInMethods();
    await userApi.cleanUp();
  });

  it('rejects another upstream account as a recoverable mismatch without creating or linking', async () => {
    const before = await getUser(userId);
    const usersBefore = await getUsers(new URLSearchParams({ page: '1', page_size: '100' }));
    const interactionBefore = await client.getInteractionData();
    expect(interactionBefore.authenticationContext).toMatchObject({
      subjectProofConnectors: [{ type: 'social', connectorId }],
    });

    const wrongSocialUserId = generateStandardId();
    const wrongState = 'wrong-state';
    const redirectUri = 'http://localhost:3000';
    const { verificationId } = await successfullyCreateSocialVerification(client, connectorId, {
      redirectUri,
      state: wrongState,
    });
    await successfullyVerifySocialAuthorization(client, connectorId, {
      verificationId,
      connectorData: {
        state: wrongState,
        redirectUri,
        code: 'fake_code',
        userId: wrongSocialUserId,
      },
    });
    await expectRejects(client.identifyUser({ verificationId }), {
      code: 'session.step_up.subject_mismatch',
      status: 403,
    });

    // The interaction still pins the subject and offers the connector: the user can retry.
    const after = await client.getInteractionData();
    expect(after.userId).toBeUndefined();
    expect(after.authenticationContext).toMatchObject({
      subjectProofConnectors: [{ type: 'social', connectorId }],
    });

    // Nothing was created or linked.
    expect(await getUser(userId)).toEqual(before);
    const usersAfter = await getUsers(new URLSearchParams({ page: '1', page_size: '100' }));
    expect(usersAfter).toHaveLength(usersBefore.length);
    expect(
      usersAfter.some((user) => user.identities['mock-social']?.userId === wrongSocialUserId)
    ).toBe(false);

    // Retrying with the account linked to the subject completes the step-up.
    const correctState = 'correct-state';
    const { verificationId: correctVerificationId } = await successfullyCreateSocialVerification(
      client,
      connectorId,
      { redirectUri, state: correctState }
    );
    await successfullyVerifySocialAuthorization(client, connectorId, {
      verificationId: correctVerificationId,
      connectorData: {
        state: correctState,
        redirectUri,
        code: 'fake_code',
        userId: socialUserId,
      },
    });
    await client.identifyUser({ verificationId: correctVerificationId });
    const identified = await client.getInteractionData();
    expect(identified.userId).toBe(userId);

    const password = generatePassword();
    await client.updateProfile({ type: 'password', value: password });
    const { redirectTo } = await client.submitInteraction();
    await client.resumeAuthorization(redirectTo);
    expect(await client.getIdTokenClaims()).toMatchObject({
      sub: userId,
      acr: firstFactorAcr,
      amr: ['fed', 'pwd'],
    });
  });
});
