import {
  InteractionEvent,
  MfaFactor,
  MfaPolicy,
  OrganizationRequiredMfaPolicy,
  SignInIdentifier,
} from '@logto/schemas';

import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { initExperienceClient, logoutClient, processSession } from '#src/helpers/client.js';
import {
  identifyUserWithUsernamePassword,
  signInWithPassword,
} from '#src/helpers/experience/index.js';
import { expectRejects } from '#src/helpers/index.js';
import { OrganizationApiTest } from '#src/helpers/organization.js';
import {
  enableAllPasswordSignInMethods,
  resetMfaSettings,
} from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';

describe('Organization required MFA policy', () => {
  const userApi = new UserApiTest();
  const organizationApi = new OrganizationApiTest();

  beforeAll(async () => {
    await enableAllPasswordSignInMethods({
      identifiers: [SignInIdentifier.Username],
      password: true,
      verify: false,
    });
  });

  afterEach(async () => {
    await Promise.all([userApi.cleanUp(), organizationApi.cleanUp()]);
  });

  afterAll(async () => {
    await resetMfaSettings();
  });

  it('should require MFA for NoPrompt settings, if user associated with organization that requires MFA and organizationRequiredMfaPolicy is Mandatory', async () => {
    await updateSignInExperience({
      mfa: {
        factors: [MfaFactor.TOTP],
        policy: MfaPolicy.NoPrompt,
        organizationRequiredMfaPolicy: OrganizationRequiredMfaPolicy.Mandatory,
      },
    });

    const { username, password } = generateNewUserProfile({ username: true, password: true });

    const user = await userApi.create({
      username,
      password,
    });

    const organizations = await Promise.all([
      organizationApi.create({ name: 'Foo', isMfaRequired: true }),
      organizationApi.create({ name: 'Bar', isMfaRequired: false }),
    ]);

    await Promise.all(organizations.map(async ({ id }) => organizationApi.addUsers(id, [user.id])));

    const client = await initExperienceClient();
    await identifyUserWithUsernamePassword(client, username, password);

    await expectRejects(client.submitInteraction(), {
      code: 'user.missing_mfa',
      status: 422,
    });
  });

  it.each([
    MfaPolicy.PromptAtSignInAndSignUp,
    MfaPolicy.PromptOnlyAtSignIn,
    MfaPolicy.UserControlled,
  ])(
    'should require MFA for %s settings, if user associated with organization that requires MFA and organizationRequiredMfaPolicy is Mandatory, even if user has MFA skipped',
    async (policy) => {
      await updateSignInExperience({
        mfa: {
          factors: [MfaFactor.TOTP],
          policy,
          organizationRequiredMfaPolicy: OrganizationRequiredMfaPolicy.Mandatory,
        },
      });

      const { username, password } = generateNewUserProfile({ username: true, password: true });

      // Register user and skip MFA
      const client = await initExperienceClient({
        interactionEvent: InteractionEvent.Register,
      });
      const { verificationId } = await client.createNewPasswordIdentityVerification({
        identifier: {
          type: SignInIdentifier.Username,
          value: username,
        },
        password,
      });
      await client.identifyUser({ verificationId });
      await client.skipMfaBinding();
      const { redirectTo } = await client.submitInteraction();
      const userId = await processSession(client, redirectTo);
      await logoutClient(client);

      const organizations = await Promise.all([
        organizationApi.create({ name: 'Foo', isMfaRequired: true }),
        organizationApi.create({ name: 'Bar', isMfaRequired: false }),
      ]);

      // Assign user to organizations
      await Promise.all(
        organizations.map(async ({ id }) => organizationApi.addUsers(id, [userId]))
      );

      // Should require MFA on next sign-in
      const signInClient = await initExperienceClient();
      await identifyUserWithUsernamePassword(signInClient, username, password);
      await expectRejects(signInClient.submitInteraction(), {
        code: 'user.missing_mfa',
        status: 422,
        unexpectedProperties: ['skippable'],
      });
    }
  );

  it.each([
    MfaPolicy.PromptAtSignInAndSignUp,
    MfaPolicy.PromptOnlyAtSignIn,
    MfaPolicy.UserControlled,
  ])(
    'should not allow skipping MFA for %s settings, if user associated with organization that requires MFA and organizationRequiredMfaPolicy is Mandatory',
    async (policy) => {
      await updateSignInExperience({
        mfa: {
          factors: [MfaFactor.TOTP],
          policy,
          organizationRequiredMfaPolicy: OrganizationRequiredMfaPolicy.Mandatory,
        },
      });

      const { username, password } = generateNewUserProfile({ username: true, password: true });
      const user = await userApi.create({ username, password });

      const organizations = await Promise.all([
        organizationApi.create({ name: 'Foo', isMfaRequired: true }),
        organizationApi.create({ name: 'Bar', isMfaRequired: false }),
      ]);
      await Promise.all(
        organizations.map(async ({ id }) => organizationApi.addUsers(id, [user.id]))
      );

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

  it('should not prompt MFA if user is not associated with any organization that requires MFA', async () => {
    await updateSignInExperience({
      mfa: {
        factors: [MfaFactor.TOTP],
        policy: MfaPolicy.NoPrompt,
        organizationRequiredMfaPolicy: OrganizationRequiredMfaPolicy.Mandatory,
      },
    });
    const { username, password } = generateNewUserProfile({ username: true, password: true });
    const user = await userApi.create({
      username,
      password,
    });
    const organization = await organizationApi.create({ name: 'Foo' });
    await organizationApi.addUsers(organization.id, [user.id]);
    await expect(
      signInWithPassword({
        identifier: { type: SignInIdentifier.Username, value: username },
        password,
      })
    ).resolves.not.toThrow();
  });

  it.each([
    MfaPolicy.PromptAtSignInAndSignUp,
    MfaPolicy.PromptOnlyAtSignIn,
    MfaPolicy.UserControlled,
  ])(
    'should allow skip MFA for %s settings, if user associated with organization that requires MFA but organizationRequiredMfaPolicy is not set',
    async (policy) => {
      await updateSignInExperience({
        mfa: {
          factors: [MfaFactor.TOTP],
          policy,
        },
      });

      const { username, password } = generateNewUserProfile({ username: true, password: true });
      const user = await userApi.create({
        username,
        password,
      });

      const organizations = await Promise.all([
        organizationApi.create({ name: 'Foo', isMfaRequired: true }),
        organizationApi.create({ name: 'Bar', isMfaRequired: false }),
      ]);
      await Promise.all(
        organizations.map(async ({ id }) => organizationApi.addUsers(id, [user.id]))
      );

      const client = await initExperienceClient();
      await identifyUserWithUsernamePassword(client, username, password);
      await expectRejects(client.submitInteraction(), {
        code: 'user.missing_mfa',
        status: 422,
      });
      await client.skipMfaBinding();
      await expect(client.submitInteraction()).resolves.not.toThrow();
    }
  );

  it.each([
    MfaPolicy.PromptAtSignInAndSignUp,
    MfaPolicy.PromptOnlyAtSignIn,
    MfaPolicy.UserControlled,
  ])(
    'should allow skip MFA for %s settings, is not associated with any organization that requires MFA',
    async (policy) => {
      await updateSignInExperience({
        mfa: {
          factors: [MfaFactor.TOTP],
          policy,
          organizationRequiredMfaPolicy: OrganizationRequiredMfaPolicy.Mandatory,
        },
      });
      const { username, password } = generateNewUserProfile({ username: true, password: true });
      const user = await userApi.create({
        username,
        password,
      });
      const organization = await organizationApi.create({ name: 'Foo' });
      await organizationApi.addUsers(organization.id, [user.id]);
      const client = await initExperienceClient();
      await identifyUserWithUsernamePassword(client, username, password);
      await expectRejects(client.submitInteraction(), {
        code: 'user.missing_mfa',
        status: 422,
      });
      await client.skipMfaBinding();
      await expect(client.submitInteraction()).resolves.not.toThrow();
    }
  );
});
