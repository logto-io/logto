import { Event, userInfoSelectFields } from '@logto/schemas';
import { HookEventPayload, HookEvent } from '@logto/schemas/models';
import { trySafe } from '@logto/shared';
import { conditional } from '@silverhand/essentials';
import { got } from 'got';
import type { Provider } from 'oidc-provider';

import modelRouters from '#src/model-routers/index.js';
import { findApplicationById } from '#src/queries/application.js';
import { findUserById } from '#src/queries/user.js';
import { getInteractionStorage } from '#src/routes/interaction/utils/interaction.js';

const eventToHook: Record<Event, HookEvent> = {
  [Event.Register]: HookEvent.PostRegister,
  [Event.SignIn]: HookEvent.PostSignIn,
  [Event.ForgotPassword]: HookEvent.PostResetPassword,
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

export type Interaction = Awaited<ReturnType<Provider['interactionDetails']>>;

export const triggerInteractionHooksIfNeeded = async (
  details?: Interaction,
  userAgent?: string
) => {
  const userId = details?.result?.login?.accountId;
  const sessionId = details?.jti;
  const applicationId = details?.params.client_id;

  if (!userId) {
    return;
  }

  const interactionPayload = getInteractionStorage(details.result);
  const { event } = interactionPayload;

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
