import {
  type MessageRateLimitPolicy,
  type SentinelActivityAction,
  SentinelActionResult,
  SentinelActivityTargetType,
  SentinelDecision,
  defaultMessageRateLimitPolicy,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { trySafe } from '@silverhand/essentials';
import { sha256 } from 'hash-wasm';

import RequestError from '#src/errors/RequestError/index.js';
import { type createSentinelActivitiesQueries } from '#src/queries/sentinel-activities.js';

type SentinelActivitiesQueries = ReturnType<typeof createSentinelActivitiesQueries>;

type MessageRateGuardQueries = Pick<
  SentinelActivitiesQueries,
  'countActivities' | 'insertActivity'
>;

/**
 * A mandatory, system-level rate limit on outbound messages (verification codes, organization
 * invitations) keyed by recipient. Separate from the identifier {@link Sentinel} (which throttles
 * failed verification attempts): this throttles *successful sends* to protect recipients from
 * spam. Its limits come from {@link defaultMessageRateLimitPolicy}, not the tenant-editable
 * `sentinelPolicy`, and are not tenant-configurable.
 *
 * Reuses the `sentinel_activities` table as the activity store via the shared queries.
 */
export class MessageRateGuard {
  constructor(
    private readonly queries: MessageRateGuardQueries,
    private readonly policy: MessageRateLimitPolicy = defaultMessageRateLimitPolicy
  ) {}

  /**
   * Throws a 429 {@link RequestError} if another send to `recipient` for `action` would exceed the
   * per-recipient cap within the policy window. Call before performing the send.
   */
  async guard(action: SentinelActivityAction, recipient: string): Promise<void> {
    const targetHash = await sha256(recipient);
    // Fail open: this is a best-effort spam guard, not a hard dependency of the send flow. If the
    // count query fails, `trySafe` returns `undefined` and we allow the send rather than block a
    // legitimate user.
    const count = await trySafe(
      this.queries.countActivities({
        targetType: SentinelActivityTargetType.User,
        targetHash,
        action,
        windowSeconds: this.policy.sendWindow,
      })
    );

    if (count !== undefined && count >= this.policy.maxSendsPerRecipient) {
      throw new RequestError({ code: 'request.rate_limited', status: 429 });
    }
  }

  /** Record a successful send so it counts toward the recipient's cap. */
  async record(action: SentinelActivityAction, recipient: string): Promise<void> {
    const targetHash = await sha256(recipient);
    // Best-effort: a failure to record must not surface to the caller after the message was sent.
    await trySafe(
      this.queries.insertActivity({
        id: generateStandardId(),
        targetType: SentinelActivityTargetType.User,
        targetHash,
        action,
        actionResult: SentinelActionResult.Success,
        payload: {},
        decision: SentinelDecision.Allowed,
      })
    );
  }
}

/**
 * Wraps a message send with the {@link MessageRateGuard}: rejects with a 429 before sending if the
 * recipient is over the cap, performs the send, then records it.
 *
 * A failed `send()` is intentionally not recorded (failed sends don't count toward the cap). A
 * `record()` failure after a successful send does not roll back the send.
 */
export const withMessageRateGuard = async <T>(
  guard: MessageRateGuard,
  { action, recipient }: { action: SentinelActivityAction; recipient: string },
  send: () => Promise<T>
): Promise<T> => {
  await guard.guard(action, recipient);
  const result = await send();
  await guard.record(action, recipient);

  return result;
};
