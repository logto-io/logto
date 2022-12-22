import { Event, userInfoSelectFields } from '@logto/schemas';
import { HookEvent } from '@logto/schemas/models';
import { trySafe } from '@logto/shared';
import { conditional } from '@silverhand/essentials';
import { got } from 'got';
import type { Provider } from 'oidc-provider';

import { getLogtoConnectorById } from '#src/connectors/index.js';
import modelRouters from '#src/model-routers/index.js';
import { findApplicationById } from '#src/queries/application.js';
import { findUserById } from '#src/queries/user.js';
import type { InteractionPayload } from '#src/routes/interaction/types/index.js';

const eventToHook: Record<Event, HookEvent> = {
  [Event.Register]: HookEvent.PostRegister,
  [Event.SignIn]: HookEvent.PostSignIn,
  [Event.ForgotPassword]: HookEvent.PostResetPassword,
};

export type HookEventPayload = {
  hookId: string;
  event: HookEvent;
  Event: Event;
  createdAt: string;
  sessionId?: string;
  userAgent?: string;
  userId?: string;
  user?: Record<string, unknown>;
  application?: Record<string, unknown>;
  connectors?: Array<Record<string, unknown>>;
};

// TODO: replace `lodash.pick`
const pick = <T, Keys extends Array<keyof T>>(
  object: T,
  ...keys: Keys
): { [key in Keys[number]]: T[key] } => {
  // eslint-disable-next-line no-restricted-syntax
  return Object.fromEntries(keys.map((key) => [key, object[key]])) as {
    [key in Keys[number]]: T[key];
  };
};

export const triggerInteractionHooksIfNeeded = async (
  interactionPayload: InteractionPayload,
  details?: Awaited<ReturnType<Provider['interactionDetails']>>,
  userAgent?: string
) => {
  const userId = details?.result?.login?.accountId;
  const sessionId = details?.jti;
  const applicationId = details?.params.client_id;

  if (!userId) {
    return;
  }

  const { event, identifier } = interactionPayload;
  const hookEvent = eventToHook[event];
  const { rows } = await modelRouters.hook.client.readAll();
  const [user, application, connector] = await Promise.all([
    trySafe(findUserById(userId)),
    trySafe(async () =>
      conditional(typeof applicationId === 'string' && (await findApplicationById(applicationId)))
    ),
    trySafe(async () =>
      conditional(
        identifier &&
          'connectorId' in identifier &&
          (await getLogtoConnectorById(identifier.connectorId))
      )
    ),
  ]);
  const payload: Omit<HookEventPayload, 'hookId'> = {
    event: hookEvent,
    Event: event,
    createdAt: new Date().toISOString(),
    sessionId,
    userAgent,
    userId,
    user: user && pick(user, ...userInfoSelectFields),
    application: application && pick(application, 'id', 'type', 'name', 'description'),
    connectors: connector && [
      pick(connector.metadata, 'id', 'name', 'description', 'platform', 'target', 'isStandard'),
    ],
  };

  await Promise.all(
    rows
      .filter(({ event }) => event === hookEvent)
      .map(async ({ config: { url, headers, retries }, id }) => {
        const json: HookEventPayload = { hookId: id, ...payload };
        await got
          .post(url, {
            headers: { 'user-agent': 'Logto (https://logto.io)', ...headers },
            json,
            retry: { limit: retries },
            timeout: { request: 10_000 },
          })
          .json();
      })
  );
};
