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
  findHookById: async (): Promise<Hook> => mockHook,
  updateHookById: async (_: unknown, data: Partial<CreateHook>): Promise<Hook> => ({
    ...mockHook,
    ...data,
  }),
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

  it('POST /hooks', async () => {
    const name = 'fooName';
    const event: HookEvent = HookEvent.PostRegister;
    const testDeprecatedEvent = HookEvent.PostSignIn;
    const events: HookEvents = [event];
    const config: Omit<HookConfig, 'signingKey'> = {
      url: 'https://example.com',
      retries: 3,
    };

    const response = await hookRequest
      .post('/hooks')
      .send({ name, event: testDeprecatedEvent, events, config });
    expect(response.status).toEqual(200);
    const generatedId = response.body.id as string;
    const generatedSigningKey = response.body.config.signingKey as string;

    expect(response.body).toEqual({
      tenantId: mockTenantIdForHook,
      id: generatedId,
      name,
      event,
      events,
      config: {
        ...config,
        signingKey: generatedSigningKey,
      },
      enabled: true,
      createdAt: mockCreatedAtForHook,
    });

    expect(response.body.event).not.toEqual(testDeprecatedEvent);
  });

  it('GET /hooks/:id', async () => {
    const response = await hookRequest.get(`/hooks/${mockNanoIdForHook}`);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockHook);
  });

  it('PATCH /hooks/:id', async () => {
    const name = 'newName';
    const event = HookEvent.PostSignIn;
    const events: HookEvents = [event];
    const testDeprecatedEvent = HookEvent.PostRegister;
    const config: Omit<HookConfig, 'signingKey'> = {
      url: 'https://new.com',
      retries: 3,
    };

    const response = await hookRequest
      .patch(`/hooks/${mockNanoIdForHook}`)
      .send({ name, event: testDeprecatedEvent, events, config });

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      ...mockHook,
      name,
      event,
      events,
      config: {
        ...config,
        signingKey: mockHook.config.signingKey,
      },
    });
    expect(response.body.event).not.toEqual(testDeprecatedEvent);
  });

  it('PATCH /hooks/:id should not update enable state', async () => {
    const newEnableState = !mockHook.enabled;
    const response = await hookRequest
      .patch(`/hooks/${mockNanoIdForHook}`)
      .send({ enabled: newEnableState });

    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockHook);
    expect(response.body.enabled).not.toEqual(newEnableState);
  });

  it('PATCH /hooks/:id should not update signing key', async () => {
    const newSigningKey = `New-${mockNanoIdForHook}`;
    const response = await hookRequest
      .patch(`/hooks/${mockNanoIdForHook}`)
      .send({ config: { signingKey: newSigningKey } });

    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockHook);
    expect(response.body.config.signingKey).not.toEqual(newSigningKey);
  });

  it('PATCH /hooks/:id/signing-key', async () => {
    const originalSigningKey = mockHook.config.signingKey;
    const response = await hookRequest.patch(`/hooks/${mockNanoIdForHook}/signing-key`).send();
    expect(response.status).toEqual(200);

    const newSigningKey = response.body.config.signingKey as string;
    expect(originalSigningKey).not.toEqual(newSigningKey);
    expect(response.body).toEqual({
      ...mockHook,
      config: {
        ...mockHook.config,
        signingKey: newSigningKey,
      },
    });
  });

  it('PATCH /hooks/:id/enabled', async () => {
    const newEnableState = !mockHook.enabled;
    const response = await hookRequest
      .patch(`/hooks/${mockNanoIdForHook}/enabled`)
      .send({ enabled: newEnableState });

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      ...mockHook,
      enabled: newEnableState,
    });
  });

  it('DELETE /hooks/:id', async () => {
    await expect(hookRequest.delete(`/hooks/${mockNanoIdForHook}`)).resolves.toHaveProperty(
      'status',
      204
    );
  });
});
