import { LogResult, type Hook, type HookEvent, type Log } from '@logto/schemas';
import { assert } from '@silverhand/essentials';

import { getWebhookRecentLogs } from '#src/api/logs.js';
import { waitFor } from '#src/utils.js';

import { mockHookResponseGuard, verifySignature } from './WebhookMockServer.js';

const getRecentHookLogs = async (hookId: string, event: HookEvent) =>
  getWebhookRecentLogs(
    hookId,
    new URLSearchParams({ logKey: `TriggerHook.${event}`, page_size: '10' })
  );

const getLatestHookLog = async (hookId: string, event: HookEvent) => {
  const logs = await getRecentHookLogs(hookId, event);

  return logs[0];
};

const waitForLatestHookLog = async (
  hookId: string,
  event: HookEvent,
  retriesLeft = 50
): Promise<Log | undefined> => {
  const logEntry = await getLatestHookLog(hookId, event);

  if (logEntry !== undefined || retriesLeft <= 1) {
    return logEntry;
  }

  await waitFor(100);

  return waitForLatestHookLog(hookId, event, retriesLeft - 1);
};

const waitForNoHookLog = async (
  hookId: string,
  event: HookEvent,
  retriesLeft = 50
): Promise<Log | undefined> => {
  const logEntry = await getLatestHookLog(hookId, event);

  if (logEntry !== undefined || retriesLeft <= 1) {
    return logEntry;
  }

  await waitFor(100);

  return waitForNoHookLog(hookId, event, retriesLeft - 1);
};

export const assertHookLogResult = async (
  { id: hookId, signingKey }: Hook,
  event: HookEvent,
  assertions: {
    errorMessage?: string;
    toBeUndefined?: boolean;
    hookPayload?: Record<string, unknown>;
  }
) => {
  const logEntry = assertions.toBeUndefined
    ? await waitForNoHookLog(hookId, event)
    : await waitForLatestHookLog(hookId, event);

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
