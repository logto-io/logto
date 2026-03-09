import {
  InteractionEvent,
  InteractionHookEvent,
  SignInIdentifier,
  hookEvents,
} from '@logto/schemas';

import { authedAdminApi } from '#src/api/api.js';
import { isDevFeaturesEnabled } from '#src/constants.js';
import { initExperienceClient, logoutClient, processSession } from '#src/helpers/client.js';
import { resetPasswordlessConnectors } from '#src/helpers/connector.js';
import {
  identifyUserWithUsernamePassword,
  identifyUserWithEmailVerificationCode,
  registerNewUserUsernamePassword,
  signInWithPassword,
} from '#src/helpers/experience/index.js';
import {
  successfullySendVerificationCode,
  successfullyVerifyVerificationCode,
} from '#src/helpers/experience/verification-code.js';
import { WebHookApiTest } from '#src/helpers/hook.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  enableAllPasswordSignInMethods,
  enableAllVerificationCodeSignInMethods,
} from '#src/helpers/sign-in-experience.js';
import { UserApiTest, generateNewUserProfile } from '#src/helpers/user.js';
import { generateEmail, generatePassword } from '#src/utils.js';

import WebhookMockServer from './WebhookMockServer.js';
import { assertHookLogResult } from './utils.js';

const supportedInteractionHookEvents = Object.values(InteractionHookEvent).filter(
  (event) => isDevFeaturesEnabled || event !== InteractionHookEvent.PostSignInAdaptiveMfaTriggered
);

const webHookMockServer = new WebhookMockServer(9999);
const userNamePrefix = 'hookTriggerTestUser';
const username = `${userNamePrefix}_0`;
const password = generatePassword();
// For email fulfilling and reset password use
const email = generateEmail();

const userApi = new UserApiTest();
const webHookApi = new WebHookApiTest();

beforeAll(async () => {
  await Promise.all([
    resetPasswordlessConnectors(),
    enableAllPasswordSignInMethods({
      identifiers: [SignInIdentifier.Username],
      password: true,
      verify: false,
    }),
    webHookMockServer.listen(),
    userApi.create({ username, password }),
  ]);
});

afterAll(async () => {
  await Promise.all([userApi.cleanUp(), webHookMockServer.close()]);
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
      identifier: { type: SignInIdentifier.Username, value: username },
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

describe('interaction api trigger hooks', () => {
  // Use new hooks for each test to ensure test isolation
  beforeEach(async () => {
    await Promise.all([
      webHookApi.create({
        name: 'interactionHookEventListener',
        events: supportedInteractionHookEvents,
        config: { url: webHookMockServer.endpoint },
      }),
      webHookApi.create({
        name: 'dataHookEventListener',
        events: hookEvents.filter((event) => !(event in InteractionHookEvent)),
        config: { url: webHookMockServer.endpoint },
      }),
      webHookApi.create({
        name: 'registerOnlyInteractionHookEventListener',
        events: [InteractionHookEvent.PostRegister],
        config: { url: webHookMockServer.endpoint },
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
    await authedAdminApi.delete(`users/${userId}`);
  });

  it('user sign in interaction API  without profile update', async () => {
    await signInWithPassword({
      identifier: { type: SignInIdentifier.Username, value: username },
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
      password: true,
      verify: true,
    });

    const interactionHook = webHookApi.hooks.get('interactionHookEventListener')!;
    const dataHook = webHookApi.hooks.get('dataHookEventListener')!;
    const user = userApi.users.find(({ username: name }) => name === username)!;

    const client = await initExperienceClient();
    await identifyUserWithUsernamePassword(client, username, password);

    await expectRejects(client.identifyUser(), {
      code: 'user.missing_profile',
      status: 422,
    });

    const identifier = { type: SignInIdentifier.Email, value: email } as const;
    const { verificationId, code } = await successfullySendVerificationCode(client, {
      identifier,
      interactionEvent: InteractionEvent.SignIn,
    });
    await successfullyVerifyVerificationCode(client, {
      identifier,
      verificationId,
      code,
    });
    await client.updateProfile({ type: SignInIdentifier.Email, verificationId });
    await client.identifyUser();

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

    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.ForgotPassword,
    });

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
