import {
  LogResult,
  userInfoSelectFields,
  type DataHookEventPayload,
  type Hook,
  type HookConfig,
  type HookEvent,
  type HookEventPayload,
  type HookTestErrorResponseData,
  type InteractionHookEventPayload,
} from '@logto/schemas';
import { generateStandardId, normalizeError, type ConsoleLog } from '@logto/shared';
import { conditional, pick, trySafe } from '@silverhand/essentials';
import { HTTPError } from 'ky';
import pMap from 'p-map';

import RequestError from '#src/errors/RequestError/index.js';
import { LogEntry } from '#src/middleware/koa-audit-log.js';
import type Queries from '#src/tenants/Queries.js';

import { type DataHookContextManager } from './context-manager.js';
import {
  interactionEventToHookEvent,
  type InteractionHookContext,
  type InteractionHookResult,
} from './types.js';
import { generateHookTestPayload, parseResponse, sendWebhookRequest } from './utils.js';

type BetterOmit<T, Ignore> = {
  [key in keyof T as key extends Ignore ? never : key]: T[key];
};

type HookEventPayloadWithoutHookId = BetterOmit<HookEventPayload, 'hookId'>;

export const createHookLibrary = (queries: Queries) => {
  const {
    applications: { findApplicationById },
    logs: { insertLog },
    // TODO: @gao should we use the library function thus we can pass full userinfo to the payload?
    users: { findUserById },
    hooks: { findAllHooks, findHookById },
  } = queries;

  /**
   * Trigger web hook with the given payload and create a log entry for the request and response.
   */
  const sendWebhook = async (
    hook: Hook,
    payload: HookEventPayloadWithoutHookId,
    consoleLog: ConsoleLog
  ) => {
    const { id, config, signingKey } = hook;
    consoleLog.info(`\tTriggering hook ${id} due to ${payload.event} event`);

    const json: HookEventPayload = { ...payload, hookId: id };
    const logEntry = new LogEntry(`TriggerHook.${payload.event}`);

    logEntry.append({ hookId: id, hookRequest: { body: json } });

    // Trigger web hook and log response
    try {
      const response = await sendWebhookRequest({
        hookConfig: config,
        payload: json,
        signingKey,
      });

      logEntry.append({
        response: await parseResponse(response),
      });
    } catch (error: unknown) {
      logEntry.append({
        result: LogResult.Error,
        response: conditional(error instanceof HTTPError && (await parseResponse(error.response))),
        error: String(normalizeError(error)),
      });
    }

    consoleLog.info(
      `\tHook ${id} ${logEntry.payload.result === LogResult.Success ? 'succeeded' : 'failed'}`
    );

    await insertLog({
      id: generateStandardId(),
      key: logEntry.key,
      payload: logEntry.payload,
    });
  };

  /**
   * Trigger multiple web hooks with concurrency control.
   */
  const sendWebhooks = async <T extends HookEventPayloadWithoutHookId>(
    webhooks: Array<{ hook: Hook; payload: T }>,
    consoleLog: ConsoleLog
  ) =>
    pMap(webhooks, async ({ hook, payload }) => sendWebhook(hook, payload, consoleLog), {
      concurrency: 10,
    });

  /**
   * Trigger interaction hooks with the given interaction context and result.
   */
  const triggerInteractionHooks = async (
    consoleLog: ConsoleLog,
    interactionContext: InteractionHookContext,
    interactionResult: InteractionHookResult,
    userAgent?: string
  ) => {
    const { userId } = interactionResult;
    const { event, sessionId, applicationId, userIp } = interactionContext;

    const hookEvent = interactionEventToHookEvent[event];
    const found = await findAllHooks();
    const hooks = found.filter(
      ({ event, events, enabled }) =>
        enabled && (events.length > 0 ? events.includes(hookEvent) : event === hookEvent) // For backward compatibility
    );

    if (hooks.length === 0) {
      return;
    }

    const [user, application] = await Promise.all([
      trySafe(findUserById(userId)),
      trySafe(async () => conditional(applicationId && (await findApplicationById(applicationId)))),
    ]);

    const payload = {
      event: hookEvent,
      interactionEvent: event,
      createdAt: new Date().toISOString(),
      sessionId,
      userAgent,
      userId,
      userIp,
      user: user && pick(user, ...userInfoSelectFields),
      application: application && pick(application, 'id', 'type', 'name', 'description'),
    } satisfies BetterOmit<InteractionHookEventPayload, 'hookId'>;

    await sendWebhooks(
      hooks.map((hook) => ({ hook, payload })),
      consoleLog
    );
  };

  /**
   * Trigger data hooks with the given data mutation context. All context objects will be used to trigger hooks.
   */
  const triggerDataHooks = async (
    consoleLog: ConsoleLog,
    contextManager: DataHookContextManager
  ) => {
    if (contextManager.contextArray.length === 0) {
      return;
    }

    const found = await findAllHooks();

    // Filter hooks that match each events
    const webhooks = contextManager.contextArray.flatMap(({ event, data }) => {
      const hooks = found.filter(
        ({ event: hookEvent, events, enabled }) =>
          enabled && (events.length > 0 ? events.includes(event) : event === hookEvent)
      );

      const payload = {
        event,
        createdAt: new Date().toISOString(),
        ...contextManager.metadata,
        ...data,
      } satisfies BetterOmit<DataHookEventPayload, 'hookId'>;

      return hooks.map((hook) => ({ hook, payload }));
    });

    await sendWebhooks(webhooks, consoleLog);
  };

  const triggerTestHook = async (hookId: string, events: HookEvent[], config: HookConfig) => {
    const { signingKey } = await findHookById(hookId);
    try {
      await Promise.all(
        events.map(async (event) => {
          const testPayload = generateHookTestPayload(hookId, event);
          await sendWebhookRequest({
            hookConfig: config,
            payload: testPayload,
            signingKey,
          });
        })
      );
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        throw new RequestError(
          {
            status: 422,
            code: 'hook.endpoint_responded_with_error',
          },
          {
            responseStatus: error.response.status,
            responseBody: await error.response.text(),
          } satisfies HookTestErrorResponseData
        );
      }

      throw new RequestError({
        code: 'hook.send_test_payload_failed',
        message: conditional(error instanceof Error && String(error)) ?? 'Unknown error',
        status: 422,
      });
    }
  };

  return {
    triggerInteractionHooks,
    triggerDataHooks,
    triggerTestHook,
  };
};
