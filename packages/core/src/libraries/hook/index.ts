import {
  userInfoSelectFields,
  type BetterOmit,
  type ExceptionHookEventPayload,
  type GrantLimitExceededEventData,
  type Hook,
  type HookConfig,
  type HookEvent,
  type HookTestErrorResponseData,
  type InteractionHookEventPayload,
} from '@logto/schemas';
import { type ConsoleLog } from '@logto/shared';
import { conditional, deduplicate, type Optional, pick, trySafe } from '@silverhand/essentials';
import { HTTPError } from 'ky';

import RequestError from '#src/errors/RequestError/index.js';
import { type CoreJobQueue, jobQueue } from '#src/job-queue/index.js';
import type Queries from '#src/tenants/Queries.js';

import {
  type HookContextManager,
  type InteractionHookDispatchContext,
  type HookMetadata,
  type HookContext,
} from './context-manager.js';
import { createWebhookDispatcher, type TenantRequestSlot } from './delivery.js';
import { createRedeliverHookLog } from './redeliver.js';
import { generateHookTestPayload, sendWebhookRequest } from './utils.js';

type CreateHookLibraryOptions = {
  tenantId?: string;
  requestSlot?: TenantRequestSlot;
  jobQueue?: CoreJobQueue;
  waitingRowCaps?: {
    perHook: number;
    perTenant: number;
  };
};

export const createHookLibrary = (queries: Queries, options?: CreateHookLibraryOptions) => {
  const {
    applications: { findApplicationById },
    logs: { insertLog, findLogById },
    // TODO: @gao should we use the library function thus we can pass full userinfo to the payload?
    users: { findUserById },
    hooks: { findAllHooks, findHookById },
    jobs: { enqueueJob, countJobsByGroup, countJobsByType },
  } = queries;

  const queue = options?.jobQueue ?? jobQueue;

  const { dispatchWebhooks, runWithTriggerLifecycle } = createWebhookDispatcher({
    insertLog,
    enqueueJob,
    countJobsByGroup,
    countJobsByType,
    queue,
    tenantId: options?.tenantId,
    requestSlot: options?.requestSlot,
    waitingRowCaps: options?.waitingRowCaps,
  });

  const fetchInteractionHookUsersById = async (
    interactionHookResults: InteractionHookDispatchContext['interactionHookResults']
  ): Promise<Map<string, Optional<Awaited<ReturnType<typeof findUserById>>>>> => {
    const userIds = deduplicate(interactionHookResults.map(({ userId }) => userId));

    // Current interaction flow typically yields very few user IDs per request.
    // If this cardinality grows in the future, switch to pMap with capped concurrency.
    const users: Array<readonly [string, Optional<Awaited<ReturnType<typeof findUserById>>>]> =
      await Promise.all(
        userIds.map(async (userId) => [userId, await trySafe(findUserById(userId))] as const)
      );

    return new Map(users);
  };

  /**
   * Trigger interaction hooks with the given interaction context and result.
   */
  const triggerInteractionHooks = async (
    consoleLog: ConsoleLog,
    dispatchContext: InteractionHookDispatchContext
  ) => {
    const { metadata, hookEvent: defaultHookEvent, interactionHookResults } = dispatchContext;

    if (interactionHookResults.length === 0) {
      return;
    }

    await runWithTriggerLifecycle(async (useJobQueue) => {
      const { interactionEvent, sessionId, applicationId, cimdClientId, userIp, userAgent } =
        metadata;

      const found = await findAllHooks();

      if (found.length === 0) {
        return;
      }

      const [application, usersById] = await Promise.all([
        trySafe(async () =>
          conditional(applicationId && (await findApplicationById(applicationId)))
        ),
        fetchInteractionHookUsersById(interactionHookResults),
      ]);

      const webhooks: Array<{
        hook: Hook;
        payload: BetterOmit<InteractionHookEventPayload, 'hookId' | 'deliveryId'>;
      }> = [];

      for (const interactionHookResult of interactionHookResults) {
        const { userId, event } = interactionHookResult;
        const customPayload =
          'payload' in interactionHookResult ? interactionHookResult.payload : undefined;
        const hookEvent = event ?? defaultHookEvent;

        const hooks = found.filter(
          ({ event, events, enabled }) =>
            enabled && (events.length > 0 ? events.includes(hookEvent) : event === hookEvent) // For backward compatibility
        );

        if (hooks.length === 0) {
          continue;
        }

        const user = usersById.get(userId);

        const payload = {
          ...customPayload,
          event: hookEvent,
          interactionEvent,
          createdAt: new Date().toISOString(),
          sessionId,
          userAgent,
          userId,
          userIp,
          user: user && pick(user, ...userInfoSelectFields),
          application: application && pick(application, 'id', 'type', 'name', 'description'),
          cimdClientId,
        } satisfies BetterOmit<InteractionHookEventPayload, 'hookId' | 'deliveryId'>;

        // eslint-disable-next-line @silverhand/fp/no-mutating-methods
        webhooks.push(...hooks.map((hook) => ({ hook, payload })));
      }

      await dispatchWebhooks(webhooks, consoleLog, useJobQueue);
    });
  };

  /**
   * Trigger data hooks with the given data mutation context. All context objects will be used to trigger hooks.
   */
  const triggerDataHooks = async (consoleLog: ConsoleLog, contextManager: HookContextManager) => {
    if (contextManager.dataHookContextArray.length === 0) {
      return;
    }

    await runWithTriggerLifecycle(async (useJobQueue) => {
      const { dataHookContextArray: contextArray, metadata } = contextManager;

      const webhooks = await buildWebhooks({ contextArray, metadata });
      await dispatchWebhooks(webhooks, consoleLog, useJobQueue);
    });
  };

  /**
   * Trigger exception hooks with the given exception mutation context. All context objects will be used to trigger hooks.
   */
  const triggerExceptionHooks = async (
    consoleLog: ConsoleLog,
    contextManager: HookContextManager
  ) => {
    if (contextManager.exceptionHookContextArray.length === 0) {
      return;
    }

    await runWithTriggerLifecycle(async (useJobQueue) => {
      const { exceptionHookContextArray: contextArray, metadata } = contextManager;

      const webhooks = await buildWebhooks({ contextArray, metadata });
      await dispatchWebhooks(webhooks, consoleLog, useJobQueue);
    });
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

  /**
   * Shared builder to construct webhook invocation list for data-like mutation contexts.
   */
  async function buildWebhooks<Event extends HookEvent>({
    contextArray,
    metadata,
  }: {
    contextArray: Array<HookContext & { event: Event }>;
    metadata: HookMetadata;
  }) {
    const foundHooks = await findAllHooks();

    // Fetch application detail if available
    const { applicationId } = metadata;
    const { ip, ...metadataWithoutIp } = metadata;
    const application =
      foundHooks.length > 0 && applicationId
        ? await trySafe(async () => findApplicationById(applicationId))
        : undefined;

    return contextArray.flatMap(({ event, includeRequestIp = true, ...rest }) => {
      const hooks = foundHooks.filter(
        ({ event: hookEvent, events, enabled }) =>
          enabled && (events.length > 0 ? events.includes(event) : event === hookEvent)
      );

      const payload = {
        event,
        createdAt: new Date().toISOString(),
        ...metadataWithoutIp,
        ...conditional(includeRequestIp && { ip }),
        ...conditional(
          application && { application: pick(application, 'id', 'type', 'name', 'description') }
        ),
        ...rest,
      };

      return hooks.map((hook) => ({ hook, payload }));
    });
  }

  /**
   * Trigger a hook event directly, enriched with standard metadata.
   *
   * Unlike `triggerInteractionHooks` / `triggerDataHooks` / `triggerExceptionHooks`, this method
   * does not go through the `HookContextManager` because callers (e.g., OIDC event listeners)
   * operate outside the middleware request context. Instead it accepts explicit metadata fields
   * and enriches the payload with application detail and standard fields (`ip`, `userAgent`)
   * to match the shape of other exception hook events.
   *
   * Note: the hook-matching and payload-enrichment logic here intentionally mirrors what
   * `buildWebhooks` does, since both need the same semantics but operate on different context
   * shapes. Keep both in sync when changing either one.
   */
  const triggerEvent = async (
    consoleLog: ConsoleLog,
    event: 'Grant.LimitExceeded',
    payload: GrantLimitExceededEventData,
    metadata?: { ip?: string; userAgent?: string }
  ) => {
    await runWithTriggerLifecycle(async (useJobQueue) => {
      const hooks = await findAllHooks();
      const matchingHooks = hooks.filter(
        ({ event: hookEvent, events, enabled }) =>
          enabled && (events.length > 0 ? events.includes(event) : event === hookEvent)
      );

      if (matchingHooks.length === 0) {
        return;
      }

      const { applicationId } = payload;
      /** A CIMD-attributed payload carries no registered application id to enrich with. */
      const application = conditional(
        applicationId && (await trySafe(async () => findApplicationById(applicationId)))
      );

      const webhookPayloads = matchingHooks.map((hook) => ({
        hook,
        payload: {
          event,
          createdAt: new Date().toISOString(),
          ...metadata,
          ...conditional(
            application && { application: pick(application, 'id', 'type', 'name', 'description') }
          ),
          ...payload,
        } satisfies BetterOmit<ExceptionHookEventPayload, 'hookId' | 'deliveryId'>,
      }));

      await dispatchWebhooks(webhookPayloads, consoleLog, useJobQueue);
    });
  };

  const redeliverHookLog = createRedeliverHookLog({
    findHookById,
    findLogById,
    enqueueJob,
    queue,
  });

  return {
    triggerInteractionHooks,
    triggerDataHooks,
    triggerExceptionHooks,
    triggerTestHook,
    triggerEvent,
    redeliverHookLog,
  };
};
