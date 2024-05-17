import {
  type Hook,
  type HookResponse,
  type Log,
  LogResult,
  SignInIdentifier,
  InteractionHookEvent,
} from '@logto/schemas';

import { deleteUser } from '#src/api/admin-user.js';
import { authedAdminApi } from '#src/api/api.js';
import { getHookCreationPayload } from '#src/helpers/hook.js';
import { createMockServer } from '#src/helpers/index.js';
import { registerNewUser } from '#src/helpers/interactions.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile } from '#src/helpers/user.js';

describe('hook logs', () => {
  const { listen, close } = createMockServer(9999);

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

  it('should get recent hook logs correctly', async () => {
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
    expect(
      logs.some(
        ({ payload: { hookId, result } }) =>
          hookId === createdHook.id && result === LogResult.Success
      )
    ).toBeTruthy();

    await authedAdminApi.delete(`hooks/${createdHook.id}`);

    await deleteUser(userId);
  });

  it('should get hook execution stats correctly', async () => {
    const createdHook = await authedAdminApi
      .post('hooks', {
        json: getHookCreationPayload(InteractionHookEvent.PostRegister, 'http://localhost:9999'),
      })
      .json<Hook>();

    const hooksWithExecutionStats = await authedAdminApi
      .get('hooks?includeExecutionStats=true')
      .json<HookResponse[]>();

    for (const hook of hooksWithExecutionStats) {
      expect(hook.executionStats).toBeTruthy();
    }

    const { username, password } = generateNewUserProfile({ username: true, password: true });
    const userId = await registerNewUser(username, password);

    const hookWithExecutionStats = await authedAdminApi
      .get(`hooks/${createdHook.id}?includeExecutionStats=true`)
      .json<HookResponse>();

    const { executionStats } = hookWithExecutionStats;

    expect(executionStats).toBeTruthy();
    expect(executionStats.requestCount).toBe(1);
    expect(executionStats.successCount).toBe(1);

    await authedAdminApi.delete(`hooks/${createdHook.id}`);

    await deleteUser(userId);
  });
});
