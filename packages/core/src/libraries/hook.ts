import {
  HookEvent,
  type HookEventPayload,
  InteractionEvent,
  LogResult,
  userInfoSelectFields,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { conditional, pick, trySafe } from '@silverhand/essentials';
import type { Response } from 'got';
import { got, HTTPError } from 'got';
import type Provider from 'oidc-provider';

import { LogEntry } from '#src/middleware/koa-audit-log.js';
import type Queries from '#src/tenants/Queries.js';

const parseResponse = ({ statusCode, body }: Response) => ({
  statusCode,
  // eslint-disable-next-line no-restricted-syntax
  body: trySafe(() => JSON.parse(String(body)) as unknown) ?? String(body),
});

const eventToHook: Record<InteractionEvent, HookEvent> = {
  [InteractionEvent.Register]: HookEvent.PostRegister,
  [InteractionEvent.SignIn]: HookEvent.PostSignIn,
  [InteractionEvent.ForgotPassword]: HookEvent.PostResetPassword,
};

export type Interaction = Awaited<ReturnType<Provider['interactionDetails']>>;

export const createHookLibrary = (queries: Queries) => {
  const {
    applications: { findApplicationById },
    logs: { insertLog },
    // TODO: @gao should we use the library function thus we can pass full userinfo to the payload?
    users: { findUserById },
    hooks: { findAllHooks },
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
    const rows = found.filter(({ event }) => event === hookEvent);

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
      rows.map(async ({ config: { url, headers, retries }, id }) => {
        console.log(`\tTriggering hook ${id} due to ${hookEvent} event`);
        const json: HookEventPayload = { hookId: id, ...payload };
        const logEntry = new LogEntry(`TriggerHook.${hookEvent}`);

        logEntry.append({ json, hookId: id });

        // Trigger web hook and log response
        await got
          .post(url, {
            headers: { 'user-agent': 'Logto (https://logto.io)', ...headers },
            json,
            retry: { limit: retries },
            timeout: { request: 10_000 },
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

        console.log(
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

  return { triggerInteractionHooksIfNeeded };
};
