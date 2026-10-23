import {
  InteractionEvent,
  MfaFactor,
  MfaPolicy,
  OrganizationRequiredMfaPolicy,
  SignInIdentifier,
} from '@logto/schemas';

import { deleteUser, updateUserLogtoConfig } from '#src/api/admin-user.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { initExperienceClient, logoutClient, processSession } from '#src/helpers/client.js';
import {
  identifyUserWithUsernamePassword,
  signInWithPassword,
} from '#src/helpers/experience/index.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  enableAllPasswordSignInMethods,
  resetMfaSettings,
} from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';

describe('User required MFA', () => {
  const userApi = new UserApiTest();

  beforeAll(async () => {
    await enableAllPasswordSignInMethods({
      identifiers: [SignInIdentifier.Username],
      password: true,
      verify: false,
    });
  });

  afterEach(async () => {
    await userApi.cleanUp();
  });

  afterAll(async () => {
    await resetMfaSettings();
  });

  it.each([
    MfaPolicy.NoPrompt,
    MfaPolicy.PromptAtSignInAndSignUp,
    MfaPolicy.PromptOnlyAtSignIn,
    MfaPolicy.UserControlled,
  ])(
    'should not allow skipping MFA for %s settings when the user is required to set up MFA',
    async (policy) => {
      await updateSignInExperience({
        mfa: {
          factors: [MfaFactor.TOTP],
          policy,
          organizationRequiredMfaPolicy: OrganizationRequiredMfaPolicy.NoPrompt,
        },
      });

      const { username, password } = generateNewUserProfile({ username: true, password: true });
      const user = await userApi.create({ username, password });
      await updateUserLogtoConfig(user.id, { mfa: { required: true }, passkeySignIn: {} });

      const client = await initExperienceClient();
      await identifyUserWithUsernamePassword(client, username, password);

      await expectRejects(client.submitInteraction(), {
        code: 'user.missing_mfa',
        status: 422,
        unexpectedProperties: ['skippable'],
      });
      await expectRejects(client.skipMfaBinding(), {
        code: 'session.mfa.mfa_policy_not_user_controlled',
        status: 422,
      });
    }
  );

  it('should force a user who previously skipped MFA to bind on the next sign-in', async () => {
    await updateSignInExperience({
      mfa: {
        factors: [MfaFactor.TOTP],
        policy: MfaPolicy.PromptAtSignInAndSignUp,
        organizationRequiredMfaPolicy: OrganizationRequiredMfaPolicy.NoPrompt,
      },
    });

    const { username, password } = generateNewUserProfile({ username: true, password: true });
    const registerClient = await initExperienceClient({
      interactionEvent: InteractionEvent.Register,
    });
    const { verificationId } = await registerClient.createNewPasswordIdentityVerification({
      identifier: {
        type: SignInIdentifier.Username,
        value: username,
      },
      password,
    });
    await registerClient.identifyUser({ verificationId });

    await expectRejects(registerClient.submitInteraction(), {
      code: 'user.suggest_mfa',
      status: 422,
    });
    await registerClient.skipMfaBinding();

    const { redirectTo } = await registerClient.submitInteraction();
    const userId = await processSession(registerClient, redirectTo);
    await logoutClient(registerClient);

    await updateUserLogtoConfig(userId, { mfa: { required: true }, passkeySignIn: {} });

    const signInClient = await initExperienceClient();
    await identifyUserWithUsernamePassword(signInClient, username, password);

    await expectRejects(signInClient.submitInteraction(), {
      code: 'user.missing_mfa',
      status: 422,
      unexpectedProperties: ['skippable'],
    });
    await expectRejects(signInClient.skipMfaBinding(), {
      code: 'session.mfa.mfa_policy_not_user_controlled',
      status: 422,
    });

    await deleteUser(userId);
  });

  it('should leave users without the requirement unchanged', async () => {
    await updateSignInExperience({
      mfa: {
        factors: [MfaFactor.TOTP],
        policy: MfaPolicy.PromptAtSignInAndSignUp,
        organizationRequiredMfaPolicy: OrganizationRequiredMfaPolicy.NoPrompt,
      },
    });

    const { username, password } = generateNewUserProfile({ username: true, password: true });
    await userApi.create({ username, password });

    const client = await initExperienceClient();
    await identifyUserWithUsernamePassword(client, username, password);

    await expectRejects(client.submitInteraction(), {
      code: 'user.suggest_mfa',
      status: 422,
    });
    await client.skipMfaBinding();
    await expect(client.submitInteraction()).resolves.not.toThrow();
  });

  it('should not enforce the user requirement when no MFA factors are enabled', async () => {
    await updateSignInExperience({
      mfa: {
        factors: [],
        policy: MfaPolicy.PromptAtSignInAndSignUp,
        organizationRequiredMfaPolicy: OrganizationRequiredMfaPolicy.NoPrompt,
      },
    });

    const { username, password } = generateNewUserProfile({ username: true, password: true });
    const user = await userApi.create({ username, password });
    await updateUserLogtoConfig(user.id, { mfa: { required: true }, passkeySignIn: {} });

    await expect(
      signInWithPassword({
        identifier: { type: SignInIdentifier.Username, value: username },
        password,
      })
    ).resolves.not.toThrow();
  });
});
