import { TemplateType } from '@logto/connector-kit';
import { Prompt } from '@logto/node';
import {
  AdditionalIdentifier,
  ConnectorType,
  InteractionEvent,
  SignInIdentifier,
  VerificationType,
  type SignInExperience,
} from '@logto/schemas';
import { maskEmail } from '@logto/shared';
import { type Optional } from '@silverhand/essentials';

import { getSignInExperience, updateSignInExperience } from '#src/api/sign-in-experience.js';
import { type ExperienceClient } from '#src/client/experience/index.js';
import { initExperienceClient, logoutClient, processSession } from '#src/helpers/client.js';
import { clearConnectorsByTypes, setEmailConnector } from '#src/helpers/connector.js';
import { authorizeWithSession } from '#src/helpers/experience/authorization.js';
import { identifyUserWithUsernamePassword } from '#src/helpers/experience/index.js';
import { expectRejects, readConnectorMessage } from '#src/helpers/index.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';
import { devFeatureTest } from '#src/utils.js';

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

  it('forbids verifying another account by raw identifier in pure step-up', async () => {
    const other = generateNewUserProfile({ username: true, password: true });
    await userApi.create(other);

    const client = await signInWithPassword(user);
    await startStepUp(client);

    await expectRejects(
      client.verifyPassword({
        identifier: { type: SignInIdentifier.Username, value: other.username },
        password: other.password,
      }),
      { code: 'session.step_up.forbidden_route', status: 403 }
    );
    const { userId: identifiedUserId } = await client.getInteractionData();
    expect(identifiedUserId).toBeUndefined();

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
