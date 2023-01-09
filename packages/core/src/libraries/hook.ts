import { generateStandardId } from '@logto/core-kit';
import { InteractionEvent, LogResult, userInfoSelectFields } from '@logto/schemas';
import { HookEventPayload, HookEvent } from '@logto/schemas/models';
import { trySafe } from '@logto/shared';
import { conditional, pick } from '@silverhand/essentials';
import type { Response } from 'got';
import { got, HTTPError } from 'got';
import type Provider from 'oidc-provider';

import { LogEntry } from '#src/middleware/koa-audit-log.js';
import modelRouters from '#src/model-routers/index.js';
import { findApplicationById } from '#src/queries/application.js';
import { insertLog } from '#src/queries/log.js';
import { findUserById } from '#src/queries/user.js';

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

export const triggerInteractionHooksIfNeeded = async (
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
  const { rows } = await modelRouters.hook.client.readAll();

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
    rows
      .filter(({ event }) => event === hookEvent)
      .map(async ({ config: { url, headers, retries }, id }) => {
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
