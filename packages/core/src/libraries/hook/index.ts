import {
  HookEvent,
  type HookEventPayload,
  InteractionEvent,
  LogResult,
  userInfoSelectFields,
  type HookConfig,
  type HookTestErrorResponseData,
} from '@logto/schemas';
import { type ConsoleLog, generateStandardId } from '@logto/shared';
import { conditional, pick, trySafe } from '@silverhand/essentials';
import { HTTPError } from 'ky';

import RequestError from '#src/errors/RequestError/index.js';
import { LogEntry } from '#src/middleware/koa-audit-log.js';
import type Queries from '#src/tenants/Queries.js';

import { generateHookTestPayload, parseResponse, sendWebhookRequest } from './utils.js';

/**
 * The context for triggering interaction hooks by `triggerInteractionHooks`.
 * In the `koaInteractionHooks` middleware,
 * we will store the context before processing the interaction and consume it after the interaction is processed if needed.
 */
export type InteractionHookContext = {
  event: InteractionEvent;
  sessionId?: string;
  applicationId?: string;
  userIp?: string;
};

/**
 * The interaction hook result for triggering interaction hooks by `triggerInteractionHooks`.
 * In the `koaInteractionHooks` middleware,
 * if we get an interaction hook result after the interaction is processed, related hooks will be triggered.
 */
export type InteractionHookResult = {
  userId: string;
};

const eventToHook: Record<InteractionEvent, HookEvent> = {
  [InteractionEvent.Register]: HookEvent.PostRegister,
  [InteractionEvent.SignIn]: HookEvent.PostSignIn,
  [InteractionEvent.ForgotPassword]: HookEvent.PostResetPassword,
};

export const createHookLibrary = (queries: Queries) => {
  const {
    applications: { findApplicationById },
    logs: { insertLog },
    // TODO: @gao should we use the library function thus we can pass full userinfo to the payload?
    users: { findUserById },
    hooks: { findAllHooks, findHookById },
  } = queries;

  const triggerInteractionHooks = async (
    consoleLog: ConsoleLog,
    interactionContext: InteractionHookContext,
    interactionResult: InteractionHookResult,
    userAgent?: string
  ) => {
    const { userId } = interactionResult;
    const { event, sessionId, applicationId, userIp } = interactionContext;

    const hookEvent = eventToHook[event];
    const found = await findAllHooks();
    const rows = found.filter(
      ({ event, events, enabled }) =>
        enabled && (events.length > 0 ? events.includes(hookEvent) : event === hookEvent) // For backward compatibility
    );

    if (rows.length === 0) {
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
    } satisfies Omit<HookEventPayload, 'hookId'>;

    await Promise.all(
      rows.map(async ({ id, config, signingKey }) => {
        consoleLog.info(`\tTriggering hook ${id} due to ${hookEvent} event`);
        const json: HookEventPayload = { hookId: id, ...payload };
        const logEntry = new LogEntry(`TriggerHook.${hookEvent}`);

        logEntry.append({ hookId: id, hookRequest: { body: json } });

        // Trigger web hook and log response
        await sendWebhookRequest({
          hookConfig: config,
          payload: json,
          signingKey,
        })
          .then(async (response) => {
            logEntry.append({
              response: await parseResponse(response),
            });
          })
          .catch(async (error) => {
            logEntry.append({
              result: LogResult.Error,
              response: conditional(
                error instanceof HTTPError && (await parseResponse(error.response))
              ),
              error: conditional(error instanceof Error && String(error)),
            });
          });

        consoleLog.info(
          `\tHook ${id} ${logEntry.payload.result === LogResult.Success ? 'succeeded' : 'failed'}`
        );

        await insertLog({
          id: generateStandardId(),
          key: logEntry.key,
          payload: logEntry.payload,
        });
      })
    );
  };

  const testHook = async (hookId: string, events: HookEvent[], config: HookConfig) => {
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
    testHook,
  };
};
