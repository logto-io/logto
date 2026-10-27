import type { Hook } from '@logto/schemas';
import { InteractionEvent, InteractionHookEvent } from '@logto/schemas';
import { ConsoleLog } from '@logto/shared';
import { createMockUtils } from '@logto/shared/esm';

import { generateHookTestPayload, parseResponse } from './utils.js';

const { jest } = import.meta;
const { mockEsm, mockEsmWithActual } = createMockUtils(jest);

// Distinct ids, unlike `mockIdGenerators()`: the point here is to tell deliveries apart.
await mockEsmWithActual('@logto/shared', () => ({
  generateStandardId: jest
    .fn()
    .mockReturnValueOnce('delivery-1')
    .mockReturnValueOnce('delivery-2')
    .mockReturnValue('delivery-unexpected'),
}));

mockEsm('#src/utils/sign.js', () => ({
  sign: () => 'mockSignature',
}));

const { sendWebhookRequest } = await mockEsmWithActual('./utils.js', () => ({
  sendWebhookRequest: jest
    .fn()
    .mockResolvedValue({ status: 200, text: async () => '{"message":"ok"}' }),
  generateHookTestPayload,
  parseResponse,
}));

const { MockQueries } = await import('#src/test-utils/tenant.js');

const createHook = (id: string): Hook => ({
  tenantId: 'bar',
  id,
  name: `hook_${id}`,
  event: InteractionHookEvent.PostSignIn,
  events: [InteractionHookEvent.PostSignIn],
  signingKey: 'signing_key',
  enabled: true,
  config: { headers: {}, url: `https://${id}.example.com`, retries: 3 },
  createdAt: Date.now() / 1000,
});

const insertLog = jest.fn();
const findAllHooks = jest.fn().mockResolvedValue([createHook('first'), createHook('second')]);

const { createHookLibrary } = await import('./index.js');
const { triggerInteractionHooks } = createHookLibrary(
  new MockQueries({
    users: { findUserById: jest.fn().mockReturnValue({ id: 'user_id' }) },
    applications: { findApplicationById: jest.fn().mockResolvedValue({ id: 'app_id' }) },
    logs: { insertLog, getHookExecutionStatsByHookId: jest.fn() },
    hooks: { findAllHooks, findHookById: jest.fn() },
  })
);

const { InteractionHookContextManager } = await import('./context-manager.js');

type SentPayload = { hookId: string; deliveryId: string };

describe('webhook delivery id', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should give each hook its own delivery id and record it as the audit log id', async () => {
    const interactionHookContext = new InteractionHookContextManager({
      interactionEvent: InteractionEvent.SignIn,
      applicationId: 'app_id',
      sessionId: 'session_id',
    });
    interactionHookContext.assignReleaseOnSuccessInteractionHookResult({ userId: 'user_id' });

    await triggerInteractionHooks(
      new ConsoleLog(),
      interactionHookContext.getReleaseOnSuccessDispatchContext()
    );

    expect(sendWebhookRequest).toHaveBeenCalledTimes(2);
    const sent = sendWebhookRequest.mock.calls.map(
      ([{ payload }]: [{ payload: SentPayload }]) => payload
    );

    // The same event, two hooks, two delivery ids
    expect(sent.map(({ hookId }) => hookId)).toEqual(['first', 'second']);
    expect(sent.map(({ deliveryId }) => deliveryId)).toEqual(['delivery-1', 'delivery-2']);

    // Each delivery's audit log entry is keyed on the delivery id it sent
    expect(insertLog).toHaveBeenCalledTimes(2);
    const logged = insertLog.mock.calls.map(([entry]: [{ id: string }]) => entry.id);
    expect(logged.slice().sort()).toEqual(['delivery-1', 'delivery-2']);
  });
});
