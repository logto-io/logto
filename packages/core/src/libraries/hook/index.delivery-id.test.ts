import type { Hook } from '@logto/schemas';
import { InteractionEvent, InteractionHookEvent } from '@logto/schemas';
import { ConsoleLog } from '@logto/shared';
import { createMockUtils } from '@logto/shared/esm';

import { CoreJobQueue } from '#src/job-queue/index.js';
import { resetDevFeaturesEnabled, setDevFeaturesEnabled } from '#src/test-utils/dev-features.js';

import { generateHookTestPayload, parseResponse } from './utils.js';

const { jest } = import.meta;
const { mockEsm, mockEsmWithActual } = createMockUtils(jest);

// Distinct ids, unlike `mockIdGenerators()`: the point here is to tell deliveries apart.
const generateStandardId = jest.fn();
await mockEsmWithActual('@logto/shared', () => ({
  generateStandardId,
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
const enqueueJob = jest.fn();
const findAllHooks = jest.fn().mockResolvedValue([createHook('first'), createHook('second')]);

const { createHookLibrary } = await import('./index.js');
const { triggerInteractionHooks } = createHookLibrary(
  new MockQueries({
    users: { findUserById: jest.fn().mockReturnValue({ id: 'user_id' }) },
    applications: { findApplicationById: jest.fn().mockResolvedValue({ id: 'app_id' }) },
    logs: { insertLog, getHookExecutionStatsByHookId: jest.fn() },
    hooks: { findAllHooks, findHookById: jest.fn() },
    jobs: { enqueueJob },
  }),
  { jobQueue: new CoreJobQueue() }
);

const { InteractionHookContextManager } = await import('./context-manager.js');

type SentPayload = { hookId: string; deliveryId: string };

describe('webhook delivery id', () => {
  beforeEach(() => {
    generateStandardId
      .mockReset()
      .mockReturnValueOnce('delivery-1')
      .mockReturnValueOnce('delivery-2')
      .mockReturnValue('delivery-unexpected');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    resetDevFeaturesEnabled();
  });

  it('should give each hook its own delivery id and record it as the audit log id when dev features are disabled', async () => {
    setDevFeaturesEnabled(false);

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
    expect(enqueueJob).not.toHaveBeenCalled();
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

  it('should give each queued hook its own delivery id as job id, dedupeKey, and serialized payload when dev features are enabled', async () => {
    setDevFeaturesEnabled(true);

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

    expect(sendWebhookRequest).not.toHaveBeenCalled();
    expect(insertLog).not.toHaveBeenCalled();
    expect(enqueueJob).toHaveBeenCalledTimes(2);

    const enqueued = enqueueJob.mock.calls.map(
      ([row]: [{ id: string; groupKey: string; dedupeKey: string; payload: string }]) => ({
        id: row.id,
        groupKey: row.groupKey,
        dedupeKey: row.dedupeKey,
        parsed: JSON.parse(row.payload) as SentPayload,
      })
    );

    expect(enqueued.map(({ groupKey }) => groupKey)).toEqual(['first', 'second']);
    expect(enqueued.map(({ id }) => id)).toEqual(['delivery-1', 'delivery-2']);
    expect(enqueued.map(({ dedupeKey }) => dedupeKey)).toEqual(['delivery-1', 'delivery-2']);
    expect(enqueued.map(({ parsed }) => parsed.hookId)).toEqual(['first', 'second']);
    expect(enqueued.map(({ parsed }) => parsed.deliveryId)).toEqual(['delivery-1', 'delivery-2']);
  });
});
