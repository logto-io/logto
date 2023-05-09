import {
  HookEvent,
  type Hook,
  type HookEvents,
  type HookConfig,
  type CreateHook,
} from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';

import {
  mockCreatedAtForHook,
  mockHook,
  mockHookList,
  mockNanoIdForHook,
  mockTenantIdForHook,
} from '#src/__mocks__/hook.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const hooks = {
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

const tenantContext = new MockTenant(undefined, { hooks });

const hookRoutes = await pickDefault(import('./hook.js'));

describe('hook routes', () => {
  const hookRequest = createRequester({ authedRoutes: hookRoutes, tenantContext });

  it('GET /hooks', async () => {
    const response = await hookRequest.get('/hooks');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockHookList);
    expect(response.header).not.toHaveProperty('total-number');
  });

  it('GET /hooks/:id', async () => {
    const hookIdInMockList = mockHookList[0]?.id ?? '';
    const response = await hookRequest.get(`/hooks/${hookIdInMockList}`);
    expect(response.status).toEqual(200);
    expect(response.body.id).toBe(hookIdInMockList);
  });

  it('POST /hooks', async () => {
    const name = 'fooName';
    const events: HookEvents = [HookEvent.PostRegister];
    const config: HookConfig = {
      url: 'https://example.com',
    };

    const response = await hookRequest.post('/hooks').send({ name, events, config });
    expect(response.status).toEqual(200);
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
    const events: HookEvents = [HookEvent.PostSignIn, HookEvent.PostRegister];
    const config: HookConfig = {
      url: 'https://example.com',
    };

    const response = await hookRequest.post('/hooks').send({ name, events, config });
    expect(response.status).toEqual(200);
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
    await expect(hookRequest.post('/hooks').send(payload)).resolves.toHaveProperty('status', 422);
  });

  it('POST /hooks should success when create a hook with the old payload format', async () => {
    const payload: Partial<Hook> = {
      event: HookEvent.PostRegister,
      config: {
        url: 'https://example.com',
        retries: 2,
      },
    };
    const response = await hookRequest.post('/hooks').send(payload);
    expect(response.status).toEqual(200);
    const generatedId = response.body.id as string;

    expect(response.body).toMatchObject({
      tenantId: mockTenantIdForHook,
      id: generatedId,
      event: HookEvent.PostRegister,
      config: {
        url: 'https://example.com',
        retries: 2,
      },
    });
  });

  it('POST /hooks/:id/signing-key', async () => {
    const targetMockHook = mockHookList[0] ?? mockHook;
    const originalSigningKey = targetMockHook.signingKey;
    const response = await hookRequest.post(`/hooks/${targetMockHook.id}/signing-key`).send();
    expect(response.status).toEqual(200);

    const newSigningKey = response.body.signingKey as string;
    expect(originalSigningKey).not.toEqual(newSigningKey);
    expect(response.body).toEqual({
      ...targetMockHook,
      signingKey: newSigningKey,
    });
  });

  it('PATCH /hooks/:id', async () => {
    const targetMockHook = mockHookList[0] ?? mockHook;
    const name = 'newName';
    const events: HookEvents = [HookEvent.PostSignIn];
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
    const events = [HookEvent.PostSignIn, HookEvent.PostResetPassword];
    const response = await hookRequest.patch(`/hooks/${targetMockHook.id}`).send({ events });

    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject({
      events,
    });
  });

  it('PATCH /hooks/:id should success when update a hook with the old payload format', async () => {
    const targetMockHook = mockHookList[0] ?? mockHook;
    const event = HookEvent.PostSignIn;
    const response = await hookRequest.patch(`/hooks/${targetMockHook.id}`).send({
      event,
      config: {
        retries: 1,
      },
    });

    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject({
      event,
      config: {
        retries: 1,
      },
    });
  });

  it('PATCH /hooks/:id with empty events list should fail', async () => {
    const invalidEvents: HookEvent[] = [];
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

  it('DELETE /hooks/:id', async () => {
    await expect(hookRequest.delete(`/hooks/${mockNanoIdForHook}`)).resolves.toHaveProperty(
      'status',
      204
    );
  });
});
