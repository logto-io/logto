import {
  InteractionEvent,
  InteractionHookEvent,
  SignInIdentifier,
  hookEvents,
} from '@logto/schemas';

import { authedAdminApi } from '#src/api/api.js';
import { resetPasswordlessConnectors } from '#src/helpers/connector.js';
import { WebHookApiTest } from '#src/helpers/hook.js';
import {
  registerNewUser,
  resetPassword,
  signInWithPassword,
  signInWithUsernamePasswordAndUpdateEmailOrPhone,
} from '#src/helpers/interactions.js';
import {
  enableAllPasswordSignInMethods,
  enableAllVerificationCodeSignInMethods,
} from '#src/helpers/sign-in-experience.js';
import { UserApiTest, generateNewUserProfile } from '#src/helpers/user.js';
import { generateEmail, generatePassword } from '#src/utils.js';

import WebhookMockServer from './WebhookMockServer.js';
import { assertHookLogResult } from './utils.js';

const webbHookMockServer = new WebhookMockServer(9999);
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
    webbHookMockServer.listen(),
    userApi.create({ username, password }),
  ]);
});

afterAll(async () => {
  await Promise.all([userApi.cleanUp(), webbHookMockServer.close()]);
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
    await signInWithPassword({ username, password });

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
    const userId = await registerNewUser(username, password);

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
    await signInWithPassword({ username, password });

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

    await signInWithUsernamePasswordAndUpdateEmailOrPhone(username, password, {
      email,
    });

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

    await resetPassword({ email }, newPassword);

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
