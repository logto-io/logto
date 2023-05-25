import {
  HookEvent,
  type HookEventPayload,
  InteractionEvent,
  LogResult,
  userInfoSelectFields,
  type Hook,
  type HookResponse,
  type HookConfig,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { conditional, pick, trySafe } from '@silverhand/essentials';
import { HTTPError } from 'got';
import type Provider from 'oidc-provider';

import RequestError from '#src/errors/RequestError/index.js';
import { LogEntry } from '#src/middleware/koa-audit-log.js';
import type Queries from '#src/tenants/Queries.js';
import { consoleLog } from '#src/utils/console.js';

import { generateHookTestPayload, parseResponse, sendWebhookRequest } from './utils.js';

const eventToHook: Record<InteractionEvent, HookEvent> = {
  [InteractionEvent.Register]: HookEvent.PostRegister,
  [InteractionEvent.SignIn]: HookEvent.PostSignIn,
  [InteractionEvent.ForgotPassword]: HookEvent.PostResetPassword,
};

export type Interaction = Awaited<ReturnType<Provider['interactionDetails']>>;

export const createHookLibrary = (queries: Queries) => {
  const {
    applications: { findApplicationById },
    logs: { insertLog, getHookExecutionStatsByHookId },
    // TODO: @gao should we use the library function thus we can pass full userinfo to the payload?
    users: { findUserById },
    hooks: { findAllHooks, findHookById },
  } = queries;

  const triggerInteractionHooksIfNeeded = async (
    event: InteractionEvent,
    details?: Interaction,
    userAgent?: string
  ) => {
    const userId = details?.result?.login?.accountId;
    const sessionId = details?.jti;
    const applicationId = details?.params.client_id;

    if (!userId) {
      return;
    }

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
      trySafe(async () =>
        conditional(typeof applicationId === 'string' && (await findApplicationById(applicationId)))
      ),
    ]);

    const payload = {
      event: hookEvent,
      interactionEvent: event,
      createdAt: new Date().toISOString(),
      sessionId,
      userAgent,
      userId,
      user: user && pick(user, ...userInfoSelectFields),
      application: application && pick(application, 'id', 'type', 'name', 'description'),
    } satisfies Omit<HookEventPayload, 'hookId'>;

    await Promise.all(
      rows.map(async ({ id, config, signingKey }) => {
        consoleLog.info(`\tTriggering hook ${id} due to ${hookEvent} event`);
        const json: HookEventPayload = { hookId: id, ...payload };
        const logEntry = new LogEntry(`TriggerHook.${hookEvent}`);

        logEntry.append({ json, hookId: id });

        // Trigger web hook and log response
        await sendWebhookRequest({
          hookConfig: config,
          payload: json,
          signingKey,
        })
          .then(async (response) => {
            logEntry.append({
              response: parseResponse(response),
            });
          })
          .catch(async (error) => {
            logEntry.append({
              result: LogResult.Error,
              response: conditional(error instanceof HTTPError && parseResponse(error.response)),
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
      /**
       * Note: We only care about whether the test payload is sent to the endpoint of the webhook,
       * so we don't care about http errors returned by the endpoint.
       */
      if (error instanceof HTTPError) {
        return;
      }

      throw new RequestError({
        code: 'hook.send_test_payload_failed',
        message: conditional(error instanceof Error && String(error)) ?? 'Unknown error',
        status: 500,
      });
    }
  };

  const attachExecutionStatsToHook = async (hook: Hook): Promise<HookResponse> => ({
    ...hook,
    executionStats: await getHookExecutionStatsByHookId(hook.id),
  });

  return {
    triggerInteractionHooksIfNeeded,
    attachExecutionStatsToHook,
    testHook,
  };
};
