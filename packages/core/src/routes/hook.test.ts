import {
  InteractionHookEvent,
  LogResult,
  hook,
  type CreateHook,
  type Hook,
  type HookConfig,
  type HookEvents,
  type Log,
} from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';
import { subDays } from 'date-fns';

import {
  mockCreatedAtForHook,
  mockHook,
  mockHookList,
  mockNanoIdForHook,
  mockTenantIdForHook,
} from '#src/__mocks__/hook.js';
import { createMockQuotaLibrary } from '#src/test-utils/quota.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const hooks = {
  getTotalNumberOfHooks: async (): Promise<{ count: number }> => ({ count: mockHookList.length }),
  findAllHooks: async (): Promise<Hook[]> => mockHookList,
  insertHook: async (data: CreateHook): Promise<Hook> => ({
    ...mockHook,
    ...data,
  }),
  findHookById: async (id: string): Promise<Hook> => {
    const hook = mockHookList.find((hook) => hook.id === id);
    if (!hook) {
      throw new Error('Not found');
    }
    return hook;
  },
  updateHookById: async (id: string, data: Partial<CreateHook>): Promise<Hook> => {
    const targetHook = mockHookList.find((hook) => hook.id === id) ?? mockHook;
    return {
      ...targetHook,
      ...data,
    };
  },
  deleteHookById: jest.fn(),
};

const mockLog: Log = {
  tenantId: 'fake_tenant',
  id: '1',
  key: 'a',
  payload: { key: 'a', result: LogResult.Success },
  createdAt: 123,
};

const mockExecutionStats = {
  requestCount: 1,
  successCount: 1,
};

const logs = {
  countLogs: jest.fn().mockResolvedValue({
    count: 1,
  }),
  findLogs: jest.fn().mockResolvedValue([mockLog]),
  getHookExecutionStatsByHookId: jest.fn().mockResolvedValue(mockExecutionStats),
};

const { countLogs, findLogs } = logs;

const mockQueries = {
  hooks,
  logs,
};

const triggerTestHook = jest.fn();

const mockLibraries = {
  hooks: { triggerTestHook },
  quota: createMockQuotaLibrary(),
};

const tenantContext = new MockTenant(undefined, mockQueries, undefined, mockLibraries);

const hookRoutes = await pickDefault(import('./hook.js'));

describe('hook routes', () => {
  const hookRequest = createRequester({ authedRoutes: hookRoutes, tenantContext });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('GET /hooks', async () => {
    const response = await hookRequest.get('/hooks');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockHookList);
    expect(response.header).not.toHaveProperty('total-number');
  });

  it('GET /hooks?page=1&page_size=20', async () => {
    const response = await hookRequest.get('/hooks?page=1&page_size=20');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockHookList);
    expect(response.header).toHaveProperty('total-number');
  });

  it('GET /hooks?includeExecutionStats', async () => {
    const response = await hookRequest.get('/hooks?includeExecutionStats=true');
    expect(response.body).toEqual(
      mockHookList.map((hook) => ({
        ...hook,
        executionStats: mockExecutionStats,
      }))
    );
  });

  it('GET /hooks/:id', async () => {
    const hookIdInMockList = mockHookList[0]?.id ?? '';
    const response = await hookRequest.get(`/hooks/${hookIdInMockList}`);
    expect(response.status).toEqual(200);
    expect(response.body.id).toBe(hookIdInMockList);
  });

  it('GET /hooks/:id?includeExecutionStats', async () => {
    const hookIdInMockList = mockHookList[0]?.id ?? '';
    const response = await hookRequest.get(`/hooks/${hookIdInMockList}?includeExecutionStats=true`);
    expect(response.body).toEqual({
      ...mockHookList[0],
      executionStats: mockExecutionStats,
    });
  });

  it('GET /hooks/:id/recent-logs should call countLogs and findLogs with correct parameters', async () => {
    jest.useFakeTimers().setSystemTime(100_000);

    const hookId = 'foo';
    const logKey = 'TriggerHook.PostSignIn';
    const page = 1;
    const pageSize = 5;

    const startTimeExclusive = subDays(new Date(100_000), 1).getTime();

    await hookRequest.get(
      `/hooks/${hookId}/recent-logs?logKey=${logKey}&page=${page}&page_size=${pageSize}`
    );
    expect(countLogs).toHaveBeenCalledWith({
      payload: { hookId },
      logKey,
      startTimeExclusive,
      includeKeyPrefix: [hook.Type.TriggerHook],
    });
    expect(findLogs).toHaveBeenCalledWith(5, 0, {
      payload: { hookId },
      logKey,
      startTimeExclusive,
      includeKeyPrefix: [hook.Type.TriggerHook],
    });

    jest.useRealTimers();
  });

  it('POST /hooks', async () => {
    const name = 'fooName';
    const events: HookEvents = [InteractionHookEvent.PostRegister];
    const config: HookConfig = {
      url: 'https://example.com',
    };

    const response = await hookRequest.post('/hooks').send({ name, events, config });
    expect(response.status).toEqual(201);
    expect(response.body.id).toBeTruthy();
    expect(response.body.signingKey).toBeTruthy();

    expect(response.body).toMatchObject({
      tenantId: mockTenantIdForHook,
      name,
      events,
      config,
      enabled: true,
      createdAt: mockCreatedAtForHook,
    });
  });

  it('POST /hooks should be able to create a hook with multi events', async () => {
    const name = 'anyName';
    const events: HookEvents = [InteractionHookEvent.PostSignIn, InteractionHookEvent.PostRegister];
    const config: HookConfig = {
      url: 'https://example.com',
    };

    const response = await hookRequest.post('/hooks').send({ name, events, config });
    expect(response.status).toEqual(201);
    expect(response.body.id).toBeTruthy();
    expect(response.body.signingKey).toBeTruthy();

    expect(response.body).toMatchObject({
      tenantId: mockTenantIdForHook,
      name,
      events,
      config,
      enabled: true,
      createdAt: mockCreatedAtForHook,
    });
  });

  it('POST /hooks should fail when no events are provided', async () => {
    const payload: Partial<Hook> = {
      name: 'hook_name',
      config: {
        url: 'https://example.com',
      },
    };
    await expect(hookRequest.post('/hooks').send(payload)).resolves.toHaveProperty('status', 400);
  });

  it('POST /hooks should success when create a hook with the old payload format', async () => {
    const payload: Partial<Hook> = {
      event: InteractionHookEvent.PostRegister,
      config: {
        url: 'https://example.com',
        retries: 2,
      },
    };
    const response = await hookRequest.post('/hooks').send(payload);
    expect(response.status).toEqual(201);
    const generatedId = response.body.id as string;

    expect(response.body).toMatchObject({
      tenantId: mockTenantIdForHook,
      id: generatedId,
      event: InteractionHookEvent.PostRegister,
      config: {
        url: 'https://example.com',
        retries: 2,
      },
    });
  });

  it('POST /hooks/:id/test should return 204 if test is successful', async () => {
    const targetMockHook = mockHookList[0] ?? mockHook;
    const response = await hookRequest.post(`/hooks/${targetMockHook.id}/test`).send({
      events: [InteractionHookEvent.PostRegister],
      config: { url: 'https://example.com' },
    });
    expect(response.status).toEqual(204);
  });

  it('PATCH /hooks/:id', async () => {
    const targetMockHook = mockHookList[0] ?? mockHook;
    const name = 'newName';
    const events: HookEvents = [InteractionHookEvent.PostSignIn];
    const config: HookConfig = {
      url: 'https://new.com',
    };

    const response = await hookRequest
      .patch(`/hooks/${targetMockHook.id}`)
      .send({ name, events, config, enabled: false });

    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject({
      name,
      events,
      config,
      enabled: false,
    });
  });

  it('PATCH /hooks/:id should success when update a hook with multi events', async () => {
    const targetMockHook = mockHookList[0] ?? mockHook;
    const events = [InteractionHookEvent.PostSignIn, InteractionHookEvent.PostResetPassword];
    const response = await hookRequest.patch(`/hooks/${targetMockHook.id}`).send({ events });

    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject({
      events,
    });
  });

  it('PATCH /hooks/:id should success when update a hook with the old payload format', async () => {
    const targetMockHook = mockHookList[0] ?? mockHook;
    const event = InteractionHookEvent.PostSignIn;
    const response = await hookRequest.patch(`/hooks/${targetMockHook.id}`).send({
      event,
      config: {
        url: 'https://example2.com',
        retries: 1,
      },
    });

    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject({
      event,
      config: {
        url: 'https://example2.com',
        retries: 1,
      },
    });
  });

  it('PATCH /hooks/:id with empty events list should fail', async () => {
    const invalidEvents: InteractionHookEvent[] = [];
    const response = await hookRequest
      .patch(`/hooks/${mockNanoIdForHook}`)
      .send({ events: invalidEvents });
    expect(response.status).toEqual(400);
  });

  it('PATCH /hooks/:id should not update signing key', async () => {
    const targetMockHook = mockHookList[0] ?? mockHook;
    const newSigningKey = `New-${targetMockHook.signingKey}`;
    const response = await hookRequest
      .patch(`/hooks/${targetMockHook.id}`)
      .send({ signingKey: newSigningKey });

    expect(response.status).toEqual(200);
    expect(response.body).toEqual(targetMockHook);
    expect(response.body.config.signingKey).not.toEqual(newSigningKey);
  });

  it('PATCH /hooks/:id/signing-key should update the singing key of a hook', async () => {
    const targetMockHook = mockHookList[0] ?? mockHook;
    const originalSigningKey = targetMockHook.signingKey;
    const response = await hookRequest.patch(`/hooks/${targetMockHook.id}/signing-key`).send();
    expect(response.status).toEqual(200);

    const newSigningKey = response.body.signingKey as string;
    expect(originalSigningKey).not.toEqual(newSigningKey);
    expect(response.body).toEqual({
      ...targetMockHook,
      signingKey: newSigningKey,
    });
  });

  it('DELETE /hooks/:id', async () => {
    await expect(hookRequest.delete(`/hooks/${mockNanoIdForHook}`)).resolves.toHaveProperty(
      'status',
      204
    );
  });
});
