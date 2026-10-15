import { Prompt } from '@logto/node';
import { ConnectorType, InteractionEvent, MfaFactor, VerificationType } from '@logto/schemas';
import { assert } from '@silverhand/essentials';
import ky from 'ky';
import { authenticator } from 'otplib';

import { mockSocialConnectorTarget } from '#src/__mocks__/connectors-mock.js';
import {
  enableAllAccountCenterFields,
  getAccountCenter,
  updateAccountCenter,
} from '#src/api/account-center.js';
import {
  getUser,
  getUserMfaVerifications,
  updateUserLogtoConfig,
  verifyUserPassword,
} from '#src/api/admin-user.js';
import api, { authedAdminApi, baseApi } from '#src/api/api.js';
import { updatePassword } from '#src/api/my-account.js';
import { getSignInExperience, updateSignInExperience } from '#src/api/sign-in-experience.js';
import { type ExperienceClient } from '#src/client/experience/index.js';
import { initExperienceClient } from '#src/helpers/client.js';
import {
  clearConnectorsByTypes,
  setEmailConnector,
  setSocialConnector,
} from '#src/helpers/connector.js';
import {
  authorizeWithSession,
  expectRedirectedError,
} from '#src/helpers/experience/authorization.js';
import { identifyUserWithUsernamePassword } from '#src/helpers/experience/index.js';
import {
  createTotp,
  expectAuthenticationContext,
  finishSignIn,
  firstFactorAcr,
  identifyWithSocial,
  linkSocialIdentity,
  mfaAcr,
  nowInSeconds,
} from '#src/helpers/experience/sign-in-with-acr.js';
import {
  successfullyCreateAndVerifyTotp,
  successfullyVerifyTotp,
} from '#src/helpers/experience/totp-verification.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  enableAllPasswordSignInMethods,
  enableUserControlledMfaWithNoPrompt,
  resetMfaSettings,
} from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';
import { devFeatureTest, generatePassword, generateTestName } from '#src/utils.js';

const startStepUp = async (client: ExperienceClient, acrValues: string) => {
  const { status, location } = await authorizeWithSession(client, {
    extraParams: { acr_values: acrValues },
  });
  expect(status).toBe(303);
  expect(location.startsWith('/step-up')).toBe(true);
  await expect(
    client.initInteraction({ interactionEvent: InteractionEvent.SignIn })
  ).resolves.toBeUndefined();
};

const submitStepUp = async (client: ExperienceClient) => {
  const { redirectTo } = await client.submitInteraction();
  await client.resumeAuthorization(redirectTo);
  return client.getIdTokenClaims();
};

devFeatureTest.describe('establishing and enrolling inside pure step-up', () => {
  const userApi = new UserApiTest();
  // eslint-disable-next-line @silverhand/fp/no-let -- Initialized by the connector fixture.
  let connectorId: string;

  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await enableUserControlledMfaWithNoPrompt();
    await clearConnectorsByTypes([ConnectorType.Social, ConnectorType.Email, ConnectorType.Sms]);
    await setEmailConnector();
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Initialize the connector fixture.
    ({ id: connectorId } = await setSocialConnector());
    await updateSignInExperience({
      adaptiveMfa: { enabled: false },
      socialSignInConnectorTargets: [mockSocialConnectorTarget],
    });
  });

  afterAll(async () => {
    await resetMfaSettings();
    await clearConnectorsByTypes([ConnectorType.Social, ConnectorType.Email]);
    await userApi.cleanUp();
  });

  const signInWithSocial = async () => {
    const { id } = await userApi.create({});
    const socialUserId = await linkSocialIdentity(id, connectorId);
    const client = await initExperienceClient();
    await identifyWithSocial(client, connectorId, socialUserId);
    const claims = await finishSignIn(client);
    expect(claims).not.toHaveProperty('acr');
    expect(claims.amr).toEqual(['fed']);

    return { client, id, socialUserId };
  };

  it('enrolls TOTP only after a fresh password proof, then persists it at submission', async () => {
    const profile = generateNewUserProfile({ username: true, password: true });
    const { id } = await userApi.create(profile);
    const client = await initExperienceClient();
    await identifyUserWithUsernamePassword(client, profile.username, profile.password);
    expect(await finishSignIn(client)).toMatchObject({ acr: firstFactorAcr, amr: ['pwd'] });
    const before = await getUser(id);
    await startStepUp(client, mfaAcr);

    // The password session cannot license enrollment; the password must be verified again.
    const unproven = await client.getInteractionData();
    expect(unproven.authenticationContext?.enrollableFactors).toEqual([]);
    await expectRejects(client.createTotpSecret(), {
      code: 'session.step_up.forbidden_route',
      status: 403,
    });
    const { verificationId: passwordVerificationId } = await client.verifyPassword({
      password: profile.password,
    });
    await client.identifyUser({ verificationId: passwordVerificationId });
    const proven = await client.getInteractionData();
    expect(proven.authenticationContext?.enrollableFactors).toEqual([MfaFactor.TOTP]);

    const verificationId = await successfullyCreateAndVerifyTotp(client);
    // Verification alone is not enrollment: the factor must also be bound.
    await expectRejects(client.submitInteraction(), {
      code: 'session.step_up.acr_not_satisfied',
      status: 403,
    });
    await client.bindMfa(MfaFactor.TOTP, verificationId);
    expect(await getUserMfaVerifications(id)).toEqual([]);

    const submittedAt = nowInSeconds();
    expectAuthenticationContext(
      await submitStepUp(client),
      { sub: id, acr: mfaAcr, amr: ['pwd', 'otp', 'mfa'] },
      submittedAt
    );
    expect(await getUserMfaVerifications(id)).toEqual([
      expect.objectContaining({ type: MfaFactor.TOTP }),
    ]);
    expect(await getUser(id)).toEqual({ ...before, updatedAt: expect.any(Number) as unknown });
  });

  it('requires upstream subject proof before establishing a password and issuing 1fa', async () => {
    const { client, id, socialUserId } = await signInWithSocial();
    const before = await getUser(id);
    await startStepUp(client, firstFactorAcr);
    const unproven = await client.getInteractionData();
    expect(unproven.authenticationContext).toMatchObject({
      availableMethods: [],
      establishableMethods: [],
      enrollableFactors: [],
      subjectProofConnectors: [{ type: 'social', connectorId }],
    });

    // A session cookie cannot establish any credential or enter an enrollment route.
    for (const path of [
      'profile',
      'verification/totp/secret',
      'verification/backup-code/generate',
      'verification/web-authn/registration',
      'verification/web-authn/registration/verify',
      'profile/mfa',
      'profile/mfa/mfa-enabled',
    ]) {
      // eslint-disable-next-line no-await-in-loop -- Exercise each route on the same unproven interaction.
      await expectRejects(
        api.post(`experience/${path}`, { headers: { cookie: client.interactionCookie } }),
        { code: 'session.step_up.forbidden_route', status: 403 }
      );
    }

    await identifyWithSocial(client, connectorId, socialUserId);
    const proven = await client.getInteractionData();
    expect(proven.authenticationContext).toMatchObject({
      establishableMethods: ['password', 'email'],
      enrollableFactors: [],
      subjectProofConnectors: [],
    });
    // Subject proof is not a first factor and cannot itself license MFA enrollment or a token.
    await expectRejects(client.createTotpSecret(), {
      code: 'session.step_up.forbidden_route',
      status: 403,
    });
    await expectRejects(client.submitInteraction(), {
      code: 'session.step_up.acr_not_satisfied',
      status: 403,
    });

    const password = generatePassword();
    await client.updateProfile({ type: 'password', value: password });
    expect(await getUser(id)).toEqual(before);
    const submittedAt = nowInSeconds();
    expectAuthenticationContext(
      await submitStepUp(client),
      { sub: id, acr: firstFactorAcr, amr: ['fed', 'pwd'] },
      submittedAt
    );
    expect(await getUser(id)).toEqual({
      ...before,
      hasPassword: true,
      updatedAt: expect.any(Number) as unknown,
    });
    await verifyUserPassword(id, password);
  });

  it('lets a social-only user with an enrolled TOTP establish a password and reach mfa', async () => {
    const { id } = await userApi.create({});
    const secret = await createTotp(id);
    // Let the upstream sign-in establish the session without an MFA challenge; the requested `mfa`
    // ignores this preference, so the enrolled factor still has to be verified in the step-up.
    await updateUserLogtoConfig(id, { mfa: { skipMfaOnSignIn: true }, passkeySignIn: {} });
    const socialUserId = await linkSocialIdentity(id, connectorId);
    const client = await initExperienceClient();
    await identifyWithSocial(client, connectorId, socialUserId);
    expect(await finishSignIn(client)).toMatchObject({ amr: ['fed'] });

    const before = await getUser(id);
    // The TOTP reaches `1fa` only and nothing pairs with it, so establishing a first factor is the
    // missing half of the pair: creation must offer it instead of fast-failing.
    await startStepUp(client, mfaAcr);
    const unproven = await client.getInteractionData();
    expect(unproven.authenticationContext).toMatchObject({
      availableMethods: [],
      establishableMethods: [],
      enrollableFactors: [],
      subjectProofConnectors: [{ type: 'social', connectorId }],
    });

    await identifyWithSocial(client, connectorId, socialUserId);
    const proven = await client.getInteractionData();
    expect(proven.authenticationContext).toMatchObject({
      establishableMethods: ['password', 'email'],
      subjectProofConnectors: [],
    });

    const password = generatePassword();
    await client.updateProfile({ type: 'password', value: password });
    expect(await getUser(id)).toEqual(before);
    // Only the established credential is staged; the enrolled factor is still owed and is the only
    // method left to offer.
    const established = await client.getInteractionData();
    expect(established.authenticationContext).toMatchObject({
      availableMethods: [VerificationType.TOTP],
      establishableMethods: [],
      enrollableFactors: [],
    });
    await successfullyVerifyTotp(client, { code: authenticator.generate(secret) });

    const submittedAt = nowInSeconds();
    expectAuthenticationContext(
      await submitStepUp(client),
      { sub: id, acr: mfaAcr, amr: ['fed', 'pwd', 'otp', 'mfa'] },
      submittedAt
    );
    // The established password is the only user write; the enrolled TOTP is left as it was.
    expect(await getUserMfaVerifications(id)).toEqual([
      expect.objectContaining({ type: MfaFactor.TOTP }),
    ]);
    expect(await getUser(id)).toEqual({
      ...before,
      hasPassword: true,
      updatedAt: expect.any(Number) as unknown,
    });
    await verifyUserPassword(id, password);
  });

  it.each(['another account', 'no account'])(
    'rejects subject proof resolving to %s',
    async (target) => {
      const { client, id } = await signInWithSocial();
      const other = await userApi.create({});
      const otherSocialId = await linkSocialIdentity(other.id, connectorId);
      const before = await getUser(id);
      const otherBefore = await getUser(other.id);
      const usersBefore = await authedAdminApi.get('users', { searchParams: { page_size: '1' } });
      const userCount = usersBefore.headers.get('total-number');
      expect(userCount).not.toBeNull();
      await startStepUp(client, firstFactorAcr);

      await expectRejects(
        identifyWithSocial(
          client,
          connectorId,
          target === 'another account' ? otherSocialId : generateTestName()
        ),
        { code: 'session.identity_conflict', status: 403 }
      );
      const rejected = await client.getInteractionData();
      expect(rejected.authenticationContext).toMatchObject({
        establishableMethods: [],
        enrollableFactors: [],
        subjectProofConnectors: [{ type: 'social', connectorId }],
      });
      await expectRejects(client.updateProfile({ type: 'password', value: generatePassword() }), {
        code: 'session.step_up.forbidden_route',
        status: 403,
      });

      // Neither registration nor account linking can occur on the callback path.
      expect(await getUser(id)).toEqual(before);
      expect(await getUser(other.id)).toEqual(otherBefore);
      const usersAfter = await authedAdminApi.get('users', { searchParams: { page_size: '1' } });
      expect(usersAfter.headers.get('total-number')).toBe(userCount);
    }
  );

  it('redirects with unmet_authentication_requirements at creation when nothing is establishable', async () => {
    const { client, id } = await signInWithSocial();
    const before = await getUser(id);
    const { signIn } = await getSignInExperience();
    await updateSignInExperience({ signIn: { methods: [] } });

    try {
      const { status, location } = await authorizeWithSession(client, {
        extraParams: { acr_values: firstFactorAcr },
      });
      expect(status).toBe(303);
      expect(location.startsWith('/step-up')).toBe(true);
      const result = await client.initInteraction({ interactionEvent: InteractionEvent.SignIn });
      assert(result?.redirectTo, new Error('Expected an unmet-ACR redirect at creation'));
      const response = await ky.get(result.redirectTo, {
        headers: { cookie: client.getCookieHeader(new URL(result.redirectTo).pathname) },
        redirect: 'manual',
        throwHttpErrors: false,
      });
      expect(response.status).toBe(303);
      expectRedirectedError(
        response.headers.get('location') ?? '',
        'unmet_authentication_requirements'
      );
      expect(await getUser(id)).toEqual(before);
    } finally {
      await updateSignInExperience({ signIn });
    }
  });

  it('does not elevate authentication context when Account API sets the initial password', async () => {
    const { client, id } = await signInWithSocial();
    const accountCenter = await getAccountCenter();
    await enableAllAccountCenterFields();

    try {
      const accessToken = await client.getAccessToken();
      const accountApi = baseApi.extend({ headers: { Authorization: `Bearer ${accessToken}` } });
      const password = generatePassword();
      await updatePassword(accountApi, undefined, password);
      await verifyUserPassword(id, password);

      // The exception authorizes only the initial write, not another sensitive operation.
      await expectRejects(updatePassword(accountApi, undefined, generatePassword()), {
        code: 'verification_record.permission_denied',
        status: 401,
      });
      const { status, location } = await authorizeWithSession(client, {
        prompt: Prompt.None,
        extraParams: { acr_values: firstFactorAcr },
      });
      expect(status).toBe(303);
      expectRedirectedError(location, 'unmet_authentication_requirements');

      // Only a fresh verification of the new password creates a Logto authentication context.
      await startStepUp(client, firstFactorAcr);
      await expectRejects(client.submitInteraction(), {
        code: 'session.step_up.acr_not_satisfied',
        status: 403,
      });
      const { verificationId } = await client.verifyPassword({ password });
      await client.identifyUser({ verificationId });
      expect(await submitStepUp(client)).toMatchObject({
        sub: id,
        acr: firstFactorAcr,
        amr: ['pwd'],
      });
    } finally {
      await updateAccountCenter(accountCenter);
    }
  });
});
