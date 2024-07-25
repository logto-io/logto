import { LogResult, type Hook, type HookEvent } from '@logto/schemas';
import { assert } from '@silverhand/essentials';

import { getWebhookRecentLogs } from '#src/api/logs.js';
import { waitFor } from '#src/utils.js';

import { mockHookResponseGuard, verifySignature } from './WebhookMockServer.js';

export const assertHookLogResult = async (
  { id: hookId, signingKey }: Hook,
  event: HookEvent,
  assertions: {
    errorMessage?: string;
    toBeUndefined?: boolean;
    hookPayload?: Record<string, unknown>;
  }
) => {
  //  Since the webhook request is async, we need to wait for a while to ensure the webhook response is received.
  await waitFor(100);

  const logs = await getWebhookRecentLogs(
    hookId,
    new URLSearchParams({ logKey: `TriggerHook.${event}`, page_size: '10' })
  );

  const logEntry = logs[0];

  if (assertions.toBeUndefined) {
    expect(logEntry).toBeUndefined();
    return;
  }

  expect(logEntry).toBeTruthy();
  assert(logEntry, new Error('Log entry not found'));

  const { payload } = logEntry;
  expect(payload.hookId).toEqual(hookId);
  expect(payload.key).toEqual(`TriggerHook.${event}`);

  const { result, error } = payload;

  if (assertions.hookPayload) {
    expect(result).toEqual(LogResult.Success);
    expect(payload.response).toBeTruthy();

    const { body } = mockHookResponseGuard.parse(payload.response);
    expect(verifySignature(body.rawPayload, signingKey, body.signature)).toBeTruthy();
    expect(body.payload).toEqual(expect.objectContaining(assertions.hookPayload));
    expect(body.payload.status).not.toBe(404);
  }

  if (assertions.errorMessage) {
    expect(result).toEqual(LogResult.Error);
    expect(error).toContain(assertions.errorMessage);
  }
};
