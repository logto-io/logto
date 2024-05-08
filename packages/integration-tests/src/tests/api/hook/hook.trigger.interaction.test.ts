import { createHmac } from 'node:crypto';
import { type RequestListener } from 'node:http';

import {
  ConnectorType,
  InteractionHookEvent,
  LogResult,
  SignInIdentifier,
  type Hook,
  type Log,
  type LogContextPayload,
  type LogKey,
} from '@logto/schemas';
import { type Optional } from '@silverhand/essentials';

import { deleteUser } from '#src/api/admin-user.js';
import { authedAdminApi } from '#src/api/api.js';
import { getWebhookRecentLogs } from '#src/api/logs.js';
import {
  clearConnectorsByTypes,
  setEmailConnector,
  setSmsConnector,
} from '#src/helpers/connector.js';
import { getHookCreationPayload } from '#src/helpers/hook.js';
import { createMockServer } from '#src/helpers/index.js';
import { registerNewUser, resetPassword, signInWithPassword } from '#src/helpers/interactions.js';
import {
  enableAllPasswordSignInMethods,
  enableAllVerificationCodeSignInMethods,
} from '#src/helpers/sign-in-experience.js';
import { generateNewUser, generateNewUserProfile } from '#src/helpers/user.js';
import { generatePassword, waitFor } from '#src/utils.js';

type HookSecureData = {
  signature: string;
  payload: string;
};

// Note: return hook payload and signature for webhook security testing
const hookServerRequestListener: RequestListener = (request, response) => {
  // eslint-disable-next-line @silverhand/fp/no-mutation
  response.statusCode = 204;

  const data: Uint8Array[] = [];
  request.on('data', (chunk: Uint8Array) => {
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    data.push(chunk);
  });

  request.on('end', () => {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    const payload = Buffer.concat(data).toString();
    response.end(
      JSON.stringify({
        signature: request.headers['logto-signature-sha-256'] as string,
        payload,
      } satisfies HookSecureData)
    );
  });
};

const assertHookLogError = ({ result, error }: LogContextPayload, errorMessage: string) =>
  result === LogResult.Error && typeof error === 'string' && error.includes(errorMessage);

describe('trigger hooks', () => {
  const { listen, close } = createMockServer(9999, hookServerRequestListener);

  beforeAll(async () => {
    await enableAllPasswordSignInMethods({
      identifiers: [SignInIdentifier.Username],
      password: true,
      verify: false,
    });
    await listen();
  });

  afterAll(async () => {
    await close();
  });

  it('should trigger sign-in hook and record error when interaction finished', async () => {
    const createdHook = await authedAdminApi
      .post('hooks', { json: getHookCreationPayload(InteractionHookEvent.PostSignIn) })
      .json<Hook>();
    const logKey: LogKey = 'TriggerHook.PostSignIn';

    const {
      userProfile: { username, password },
      user,
    } = await generateNewUser({ username: true, password: true });

    await signInWithPassword({ username, password });

    // Check hook trigger log
    const logs = await getWebhookRecentLogs(
      createdHook.id,
      new URLSearchParams({ logKey, page_size: '100' })
    );

    const hookLog = logs.find(({ payload: { hookId } }) => hookId === createdHook.id);
    expect(hookLog).toBeTruthy();

    if (hookLog) {
      expect(
        assertHookLogError(hookLog.payload, 'Failed to parse URL from not_work_url')
      ).toBeTruthy();
    }

    // Clean up
    await authedAdminApi.delete(`hooks/${createdHook.id}`);
    await deleteUser(user.id);
  });

  it('should trigger multiple register hooks and record properly when interaction finished', async () => {
    const [hook1, hook2, hook3] = await Promise.all([
      authedAdminApi
        .post('hooks', { json: getHookCreationPayload(InteractionHookEvent.PostRegister) })
        .json<Hook>(),
      authedAdminApi
        .post('hooks', {
          json: getHookCreationPayload(InteractionHookEvent.PostRegister, 'http://localhost:9999'),
        })
        .json<Hook>(),
      // Using the old API to create a hook
      authedAdminApi
        .post('hooks', {
          json: {
            event: InteractionHookEvent.PostRegister,
            config: { url: 'http://localhost:9999', retries: 2 },
          },
        })
        .json<Hook>(),
    ]);
    const logKey: LogKey = 'TriggerHook.PostRegister';

    const { username, password } = generateNewUserProfile({ username: true, password: true });
    const userId = await registerNewUser(username, password);

    type HookRequest = {
      body: {
        userIp?: string;
      } & Record<string, unknown>;
    };

    // Check hook trigger log
    for (const [hook, expectedResult, expectedError] of [
      [hook1, LogResult.Error, 'Failed to parse URL from not_work_url'],
      [hook2, LogResult.Success, undefined],
      [hook3, LogResult.Success, undefined],
    ] satisfies Array<[Hook, LogResult, Optional<string>]>) {
      // eslint-disable-next-line no-await-in-loop
      const logs = await getWebhookRecentLogs(
        hook.id,
        new URLSearchParams({ logKey, page_size: '100' })
      );

      const log = logs.find(({ payload: { hookId } }) => hookId === hook.id);

      expect(log).toBeTruthy();

      // Skip the test if the log is not found
      if (!log) {
        return;
      }

      // Assert user ip is in the hook request
      expect((log.payload.hookRequest as HookRequest).body.userIp).toBeTruthy();

      // Assert the log result and error message
      expect(log.payload.result).toEqual(expectedResult);

      if (expectedError) {
        expect(assertHookLogError(log.payload, expectedError)).toBeTruthy();
      }
    }

    // Clean up
    await Promise.all([
      authedAdminApi.delete(`hooks/${hook1.id}`),
      authedAdminApi.delete(`hooks/${hook2.id}`),
      authedAdminApi.delete(`hooks/${hook3.id}`),
    ]);
    await deleteUser(userId);
  });

  it('should secure webhook payload data successfully', async () => {
    const createdHook = await authedAdminApi
      .post('hooks', {
        json: getHookCreationPayload(InteractionHookEvent.PostRegister, 'http://localhost:9999'),
      })
      .json<Hook>();

    const { username, password } = generateNewUserProfile({ username: true, password: true });
    const userId = await registerNewUser(username, password);

    const logs = await authedAdminApi
      .get(`hooks/${createdHook.id}/recent-logs?page_size=100`)
      .json<Log[]>();

    const log = logs.find(({ payload: { hookId } }) => hookId === createdHook.id);
    expect(log).toBeTruthy();

    const response = log?.payload.response;
    expect(response).toBeTruthy();

    const {
      body: { signature, payload },
    } = response as { body: HookSecureData };

    expect(signature).toBeTruthy();
    expect(payload).toBeTruthy();

    const calculateSignature = createHmac('sha256', createdHook.signingKey)
      .update(payload)
      .digest('hex');

    expect(calculateSignature).toEqual(signature);

    await authedAdminApi.delete(`hooks/${createdHook.id}`);

    await deleteUser(userId);
  });

  it('should trigger reset password hook and record properly when interaction finished', async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
    await setEmailConnector();
    await setSmsConnector();
    await enableAllVerificationCodeSignInMethods({
      identifiers: [SignInIdentifier.Email, SignInIdentifier.Phone],
      password: true,
      verify: true,
    });
    // Create a reset password hook
    const resetPasswordHook = await authedAdminApi
      .post('hooks', {
        json: getHookCreationPayload(
          InteractionHookEvent.PostResetPassword,
          'http://localhost:9999'
        ),
      })
      .json<Hook>();
    const logKey: LogKey = 'TriggerHook.PostResetPassword';

    const { user, userProfile } = await generateNewUser({
      primaryPhone: true,
      primaryEmail: true,
      password: true,
    });
    // Reset Password by Email
    await resetPassword({ email: userProfile.primaryEmail }, generatePassword());
    // Reset Password by Phone
    await resetPassword({ phone: userProfile.primaryPhone }, generatePassword());
    // Wait for the hook to be trigged
    await waitFor(1000);

    const relatedLogs = await getWebhookRecentLogs(
      resetPasswordHook.id,
      new URLSearchParams({ logKey, page_size: '100' })
    );
    const succeedLogs = relatedLogs.filter(
      ({ payload: { result } }) => result === LogResult.Success
    );

    expect(succeedLogs).toHaveLength(2);

    await authedAdminApi.delete(`hooks/${resetPasswordHook.id}`);
    await deleteUser(user.id);
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
  });
});
