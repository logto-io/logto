import { hook, hookEventGuard, LogResult, Logs } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { UniqueIntegrityConstraintViolationError } from '@silverhand/slonik';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import { type CoreJobQueue } from '#src/job-queue/index.js';
import {
  serializeWebhookRedeliveryJobPayload,
  webhookJobType,
} from '#src/job-queue/webhook-handler.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

const redeliverableHookRequestGuard = z.object({
  body: z
    .object({
      event: hookEventGuard,
      deliveryId: z.string().min(1).optional(),
    })
    .passthrough(),
});

type CreateRedeliverHookLogInput = {
  findHookById: Queries['hooks']['findHookById'];
  findLogById: Queries['logs']['findLogById'];
  enqueueJob: Queries['jobs']['enqueueJob'];
  queue: Pick<CoreJobQueue, 'wake'>;
};

/**
 * Create the manual redelivery handler that validates a permanently failed webhook log and
 * re-enqueues it while preserving the original `deliveryId` for receiver deduplication.
 */
export const createRedeliverHookLog =
  ({ findHookById, findLogById, enqueueJob, queue }: CreateRedeliverHookLogInput) =>
  async (hookId: string, logId: string): Promise<{ logId: string }> => {
    const hookRecord = await findHookById(hookId);
    assertThat(hookRecord.enabled, new RequestError({ code: 'hook.disabled', status: 422 }));

    const log = await findLogById(logId);
    assertThat(
      log.payloadHookId === hookId && log.key.startsWith(`${hook.Type.TriggerHook}.`),
      new RequestError({
        code: 'entity.not_exists_with_id',
        name: Logs.table,
        id: logId,
        status: 404,
      })
    );
    assertThat(
      log.payload.result === LogResult.Error && log.payload.nextAttemptAt === undefined,
      new RequestError({ code: 'hook.log_not_permanently_failed', status: 422 })
    );

    const parsedRequest = redeliverableHookRequestGuard.safeParse(log.payload.hookRequest);
    assertThat(
      parsedRequest.success,
      new RequestError({ code: 'hook.invalid_log_payload', status: 422 })
    );

    const { body } = parsedRequest.data;
    const deliveryId = body.deliveryId ?? log.id;
    const rawBody = JSON.stringify(body);
    const newLogId = generateStandardId();

    try {
      await enqueueJob({
        id: newLogId,
        type: webhookJobType,
        groupKey: hookId,
        dedupeKey: deliveryId,
        payload: serializeWebhookRedeliveryJobPayload({
          rawBody,
          redeliveredFrom: logId,
        }),
      });
    } catch (error: unknown) {
      if (
        error instanceof UniqueIntegrityConstraintViolationError &&
        error.constraint === 'jobs__type_dedupe_key'
      ) {
        throw new RequestError({
          code: 'hook.redelivery_in_progress',
          status: 409,
        });
      }

      throw error;
    }

    queue.wake();

    return { logId: newLogId };
  };
