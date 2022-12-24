import type { LogKey } from '@logto/schemas';
import { LogResult, Event } from '@logto/schemas';
import type { Hooks } from '@logto/schemas/models';
import { HookEvent } from '@logto/schemas/models';
import type { InferModelType } from '@withtyped/server';

import { authedAdminApi, deleteUser, getLogs, putInteraction } from '#src/api/index.js';
import { createMockServer } from '#src/helpers.js';

import { initClient, processSession } from './interaction/utils/client.js';
import { generateNewUser, generateNewUserProfile } from './interaction/utils/user.js';

type Hook = InferModelType<typeof Hooks>;

const createPayload = (event: HookEvent, url = 'not_work_url'): Partial<Hook> => ({
  event,
  config: {
    url,
    headers: { foo: 'bar' },
    retries: 3,
  },
});

describe('hooks', () => {
  it('should be able to create, query, and delete a hook', async () => {
    const payload = createPayload(HookEvent.PostRegister);
    const created = await authedAdminApi.post('hooks', { json: payload }).json<Hook>();

    expect(payload.event).toEqual(created.event);
    expect(payload.config).toEqual(created.config);

    expect(await authedAdminApi.get('hooks').json<Hook[]>()).toContainEqual(created);
    expect(await authedAdminApi.get(`hooks/${created.id}`).json<Hook>()).toEqual(created);
    expect(await authedAdminApi.delete(`hooks/${created.id}`)).toHaveProperty('statusCode', 204);
    await expect(authedAdminApi.get(`hooks/${created.id}`)).rejects.toHaveProperty(
      'response.statusCode',
      404
    );
  });

  it('should trigger sign-in hook and record error when interaction finished', async () => {
    const createdHook = await authedAdminApi
      .post('hooks', { json: createPayload(HookEvent.PostSignIn) })
      .json<Hook>();
    const logKey: LogKey = 'TriggerHook.PostSignIn';

    // Init session and submit
    const {
      userProfile: { username, password },
      user,
    } = await generateNewUser({ username: true, password: true });
    const client = await initClient();
    await client.successSend(putInteraction, {
      event: Event.SignIn,
      identifier: {
        username,
        password,
      },
    });
    await client.submitInteraction();

    // Check hook trigger log
    const logs = await getLogs(new URLSearchParams({ logKey, page_size: '100' }));
    expect(
      logs.some(
        ({ payload: { hookId, result } }) => hookId === createdHook.id && result === LogResult.Error
      )
    ).toBeTruthy();

    // Clean up
    await authedAdminApi.delete(`hooks/${createdHook.id}`);
    await deleteUser(user.id);
  });

  it('should trigger multiple register hooks and record properly when interaction finished', async () => {
    const [hook1, hook2] = await Promise.all([
      authedAdminApi.post('hooks', { json: createPayload(HookEvent.PostRegister) }).json<Hook>(),
      authedAdminApi
        .post('hooks', { json: createPayload(HookEvent.PostRegister, 'http://localhost:9999') })
        .json<Hook>(),
    ]);
    const logKey: LogKey = 'TriggerHook.PostRegister';
    const { listen, close } = createMockServer(9999);
    await listen(); // Start mock server

    // Init session and submit
    const { username, password } = generateNewUserProfile({ username: true, password: true });
    const client = await initClient();
    await client.send(putInteraction, {
      event: Event.Register,
      profile: {
        username,
        password,
      },
    });
    const { redirectTo } = await client.submitInteraction();
    const id = await processSession(client, redirectTo);
    await close(); // Stop mock server early

    // Check hook trigger log
    const logs = await getLogs(new URLSearchParams({ logKey, page_size: '100' }));
    expect(
      logs.some(
        ({ payload: { hookId, result } }) => hookId === hook1.id && result === LogResult.Error
      )
    ).toBeTruthy();
    expect(
      logs.some(
        ({ payload: { hookId, result } }) => hookId === hook2.id && result === LogResult.Success
      )
    ).toBeTruthy();

    // Clean up
    await Promise.all([
      authedAdminApi.delete(`hooks/${hook1.id}`),
      authedAdminApi.delete(`hooks/${hook2.id}`),
    ]);
    await deleteUser(id);
  });
});
