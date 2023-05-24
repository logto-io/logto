import { createHmac } from 'node:crypto';
import { type RequestListener } from 'node:http';

import {
  type Hook,
  HookEvent,
  type LogKey,
  LogResult,
  SignInIdentifier,
  type Log,
} from '@logto/schemas';

import { deleteUser } from '#src/api/admin-user.js';
import { authedAdminApi } from '#src/api/api.js';
import { getLogs } from '#src/api/logs.js';
import { getHookCreationPayload } from '#src/helpers/hook.js';
import { createMockServer } from '#src/helpers/index.js';
import { registerNewUser, signInWithPassword } from '#src/helpers/interactions.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateNewUser, generateNewUserProfile } from '#src/helpers/user.js';

type HookSecureData = {
  signature: string;
  payload: string;
};

// Note: return hook payload and signature for webhook security testing
const hookServerRequestListener: RequestListener = (request, response) => {
  // eslint-disable-next-line @silverhand/fp/no-mutation
  response.statusCode = 204;

  const data: Buffer[] = [];
  request.on('data', (chunk: Buffer) => {
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
      .post('hooks', { json: getHookCreationPayload(HookEvent.PostSignIn) })
      .json<Hook>();
    const logKey: LogKey = 'TriggerHook.PostSignIn';

    const {
      userProfile: { username, password },
      user,
    } = await generateNewUser({ username: true, password: true });

    await signInWithPassword({ username, password });

    // Check hook trigger log
    const logs = await getLogs(new URLSearchParams({ logKey, page_size: '100' }));
    expect(
      logs.some(
        ({ payload: { hookId, result, error } }) =>
          hookId === createdHook.id &&
          result === LogResult.Error &&
          error === 'RequestError: Invalid URL'
      )
    ).toBeTruthy();

    // Clean up
    await authedAdminApi.delete(`hooks/${createdHook.id}`);
    await deleteUser(user.id);
  });

  it('should trigger multiple register hooks and record properly when interaction finished', async () => {
    const [hook1, hook2, hook3] = await Promise.all([
      authedAdminApi
        .post('hooks', { json: getHookCreationPayload(HookEvent.PostRegister) })
        .json<Hook>(),
      authedAdminApi
        .post('hooks', {
          json: getHookCreationPayload(HookEvent.PostRegister, 'http://localhost:9999'),
        })
        .json<Hook>(),
      // Using the old API to create a hook
      authedAdminApi
        .post('hooks', {
          json: {
            event: HookEvent.PostRegister,
            config: { url: 'http://localhost:9999', retries: 2 },
          },
        })
        .json<Hook>(),
    ]);
    const logKey: LogKey = 'TriggerHook.PostRegister';

    const { username, password } = generateNewUserProfile({ username: true, password: true });
    const userId = await registerNewUser(username, password);

    // Check hook trigger log
    const logs = await getLogs(new URLSearchParams({ logKey, page_size: '100' }));
    expect(
      logs.some(
        ({ payload: { hookId, result, error } }) =>
          hookId === hook1.id && result === LogResult.Error && error === 'RequestError: Invalid URL'
      )
    ).toBeTruthy();
    expect(
      logs.some(
        ({ payload: { hookId, result } }) => hookId === hook2.id && result === LogResult.Success
      )
    ).toBeTruthy();
    expect(
      logs.some(
        ({ payload: { hookId, result } }) => hookId === hook3.id && result === LogResult.Success
      )
    ).toBeTruthy();

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
        json: getHookCreationPayload(HookEvent.PostRegister, 'http://localhost:9999'),
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
});
