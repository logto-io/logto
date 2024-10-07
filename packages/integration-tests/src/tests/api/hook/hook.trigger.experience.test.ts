import {
  hookEvents,
  InteractionEvent,
  InteractionHookEvent,
  SignInIdentifier,
} from '@logto/schemas';

import { deleteUser } from '#src/api/admin-user.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { SsoConnectorApi } from '#src/api/sso-connector.js';
import { initExperienceClient, logoutClient, processSession } from '#src/helpers/client.js';
import { resetPasswordlessConnectors } from '#src/helpers/connector.js';
import {
  fulfillUserEmail,
  identifyUserWithEmailVerificationCode,
  identifyUserWithUsernamePassword,
  registerNewUserUsernamePassword,
  registerNewUserWithVerificationCode,
  signInWithEnterpriseSso,
  signInWithPassword,
} from '#src/helpers/experience/index.js';
import { WebHookApiTest } from '#src/helpers/hook.js';
import { OrganizationApiTest } from '#src/helpers/organization.js';
import {
  enableAllPasswordSignInMethods,
  enableAllVerificationCodeSignInMethods,
} from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';
import { generateEmail, generatePassword, randomString } from '#src/utils.js';

import WebhookMockServer from './WebhookMockServer.js';
import { assertHookLogResult } from './utils.js';

const webbHookMockServer = new WebhookMockServer(9999);
const userNamePrefix = 'experienceApiHookTriggerTestUser';
const username = `${userNamePrefix}_0`;
const password = generatePassword();
// For email fulfilling and reset password use
const email = generateEmail();

const userApi = new UserApiTest();
const webHookApi = new WebHookApiTest();
const organizationApi = new OrganizationApiTest();
const ssoConnectorApi = new SsoConnectorApi();

beforeAll(async () => {
  await Promise.all([
    resetPasswordlessConnectors(),
    enableAllPasswordSignInMethods({
      identifiers: [SignInIdentifier.Username],
      password: true,
      verify: false,
    }),
    webbHookMockServer.listen(),
    userApi.create({ username, password }),
  ]);
});

afterAll(async () => {
  await Promise.all([userApi.cleanUp(), webbHookMockServer.close()]);
});

afterEach(async () => {
  await Promise.all([organizationApi.cleanUp(), ssoConnectorApi.cleanUp()]);
});

describe('trigger invalid hook', () => {
  beforeAll(async () => {
    await webHookApi.create({
      name: 'invalidHookEventListener',
      events: [InteractionHookEvent.PostSignIn],
      config: { url: 'not_work_url' },
    });
  });

  it('should log invalid hook url error', async () => {
    await signInWithPassword({
      identifier: {
        type: SignInIdentifier.Username,
        value: username,
      },
      password,
    });

    const hook = webHookApi.hooks.get('invalidHookEventListener')!;

    await assertHookLogResult(hook, InteractionHookEvent.PostSignIn, {
      errorMessage: 'Failed to parse URL from not_work_url',
    });
  });

  afterAll(async () => {
    await webHookApi.cleanUp();
  });
});

describe('experience api hook trigger', () => {
  // Use new hooks for each test to ensure test isolation
  beforeEach(async () => {
    await Promise.all([
      webHookApi.create({
        name: 'interactionHookEventListener',
        events: Object.values(InteractionHookEvent),
        config: { url: webbHookMockServer.endpoint },
      }),
      webHookApi.create({
        name: 'dataHookEventListener',
        events: hookEvents.filter((event) => !(event in InteractionHookEvent)),
        config: { url: webbHookMockServer.endpoint },
      }),
      webHookApi.create({
        name: 'registerOnlyInteractionHookEventListener',
        events: [InteractionHookEvent.PostRegister],
        config: { url: webbHookMockServer.endpoint },
      }),
    ]);
  });

  afterEach(async () => {
    await webHookApi.cleanUp();
  });

  it('new user registration interaction API', async () => {
    const interactionHook = webHookApi.hooks.get('interactionHookEventListener')!;
    const registerHook = webHookApi.hooks.get('registerOnlyInteractionHookEventListener')!;
    const dataHook = webHookApi.hooks.get('dataHookEventListener')!;

    const { username, password } = generateNewUserProfile({ username: true, password: true });
    const userId = await registerNewUserUsernamePassword(username, password);

    const interactionHookEventPayload: Record<string, unknown> = {
      event: InteractionHookEvent.PostRegister,
      interactionEvent: InteractionEvent.Register,
      sessionId: expect.any(String),
      user: expect.objectContaining({ id: userId, username }),
    };

    await assertHookLogResult(interactionHook, InteractionHookEvent.PostRegister, {
      hookPayload: interactionHookEventPayload,
    });

    // Verify multiple hooks can be triggered with the same event
    await assertHookLogResult(registerHook, InteractionHookEvent.PostRegister, {
      hookPayload: interactionHookEventPayload,
    });

    // Verify data hook is triggered
    await assertHookLogResult(dataHook, 'User.Created', {
      hookPayload: {
        event: 'User.Created',
        interactionEvent: InteractionEvent.Register,
        sessionId: expect.any(String),
        data: expect.objectContaining({ id: userId, username }),
      },
    });

    // Assert user updated event is not triggered
    await assertHookLogResult(dataHook, 'User.Data.Updated', {
      toBeUndefined: true,
    });

    // Clean up
    await deleteUser(userId);
  });

  it('user sign in interaction API  without profile update', async () => {
    await signInWithPassword({
      identifier: {
        type: SignInIdentifier.Username,
        value: username,
      },
      password,
    });

    const interactionHook = webHookApi.hooks.get('interactionHookEventListener')!;
    const dataHook = webHookApi.hooks.get('dataHookEventListener')!;
    const user = userApi.users.find(({ username: name }) => name === username)!;

    const interactionHookEventPayload: Record<string, unknown> = {
      event: InteractionHookEvent.PostSignIn,
      interactionEvent: InteractionEvent.SignIn,
      sessionId: expect.any(String),
      user: expect.objectContaining({ id: user.id, username }),
    };

    await assertHookLogResult(interactionHook, InteractionHookEvent.PostSignIn, {
      hookPayload: interactionHookEventPayload,
    });

    // Verify user create data hook is not triggered
    await assertHookLogResult(dataHook, 'User.Created', {
      toBeUndefined: true,
    });

    await assertHookLogResult(dataHook, 'User.Data.Updated', {
      toBeUndefined: true,
    });
  });

  it('user sign in interaction API with profile update', async () => {
    await enableAllVerificationCodeSignInMethods({
      identifiers: [SignInIdentifier.Email],
      password: false,
      verify: true,
    });

    const interactionHook = webHookApi.hooks.get('interactionHookEventListener')!;
    const dataHook = webHookApi.hooks.get('dataHookEventListener')!;
    const user = userApi.users.find(({ username: name }) => name === username)!;

    const client = await initExperienceClient();

    await identifyUserWithUsernamePassword(client, username, password);
    await fulfillUserEmail(client, email);
    const { redirectTo } = await client.submitInteraction();
    await processSession(client, redirectTo);
    await logoutClient(client);

    const interactionHookEventPayload: Record<string, unknown> = {
      event: InteractionHookEvent.PostSignIn,
      interactionEvent: InteractionEvent.SignIn,
      sessionId: expect.any(String),
      user: expect.objectContaining({ id: user.id, username }),
    };

    await assertHookLogResult(interactionHook, InteractionHookEvent.PostSignIn, {
      hookPayload: interactionHookEventPayload,
    });

    // Verify user create data hook is not triggered
    await assertHookLogResult(dataHook, 'User.Created', {
      toBeUndefined: true,
    });

    await assertHookLogResult(dataHook, 'User.Data.Updated', {
      hookPayload: {
        event: 'User.Data.Updated',
        interactionEvent: InteractionEvent.SignIn,
        sessionId: expect.any(String),
        data: expect.objectContaining({ id: user.id, username, primaryEmail: email }),
      },
    });
  });

  it('password reset interaction API', async () => {
    const newPassword = generatePassword();
    const interactionHook = webHookApi.hooks.get('interactionHookEventListener')!;
    const dataHook = webHookApi.hooks.get('dataHookEventListener')!;
    const user = userApi.users.find(({ username: name }) => name === username)!;

    const client = await initExperienceClient(InteractionEvent.ForgotPassword);
    await identifyUserWithEmailVerificationCode(client, email);
    await client.resetPassword({ password: newPassword });
    await client.submitInteraction();

    const interactionHookEventPayload: Record<string, unknown> = {
      event: InteractionHookEvent.PostResetPassword,
      interactionEvent: InteractionEvent.ForgotPassword,
      sessionId: expect.any(String),
      user: expect.objectContaining({ id: user.id, username, primaryEmail: email }),
    };

    await assertHookLogResult(interactionHook, InteractionHookEvent.PostResetPassword, {
      hookPayload: interactionHookEventPayload,
    });

    await assertHookLogResult(dataHook, 'User.Data.Updated', {
      hookPayload: {
        event: 'User.Data.Updated',
        interactionEvent: InteractionEvent.ForgotPassword,
        sessionId: expect.any(String),
        data: expect.objectContaining({ id: user.id, username, primaryEmail: email }),
      },
    });
  });
});

describe('organization jit provisioning hook trigger', () => {
  const hookName = 'organizationJitProvisioningHookEventListener';

  beforeAll(async () => {
    await webHookApi.create({
      name: hookName,
      events: ['Organization.Membership.Updated'],
      config: { url: webbHookMockServer.endpoint },
    });
  });

  const assertOrganizationMembershipUpdated = async (organizationId: string) =>
    assertHookLogResult(webHookApi.hooks.get(hookName)!, 'Organization.Membership.Updated', {
      hookPayload: {
        event: 'Organization.Membership.Updated',
        organizationId,
      },
    });

  it('should trigger `Organization.Membership.Updated` event when user is provisioned by experience', async () => {
    const organization = await organizationApi.create({ name: 'foo' });
    const domain = 'example.com';
    await organizationApi.jit.addEmailDomain(organization.id, domain);

    const userId = await registerNewUserWithVerificationCode({
      type: SignInIdentifier.Email,
      value: generateEmail(domain),
    });
    await assertOrganizationMembershipUpdated(organization.id);
    await deleteUser(userId);
  });

  it('should trigger `Organization.Membership.Updated` event when user is provisioned by SSO', async () => {
    const organization = await organizationApi.create({ name: 'bar' });
    const domain = 'sso_example.com';
    const connector = await ssoConnectorApi.createMockOidcConnector([domain]);
    await organizationApi.jit.ssoConnectors.add(organization.id, [connector.id]);
    const email = generateEmail(domain);
    const sub = randomString();

    await updateSignInExperience({
      singleSignOnEnabled: true,
    });

    const userId = await signInWithEnterpriseSso(
      ssoConnectorApi.firstConnectorId!,
      {
        sub,
        email,
        email_verified: true,
      },
      true
    );

    await assertOrganizationMembershipUpdated(organization.id);

    await deleteUser(userId);
  });
});
