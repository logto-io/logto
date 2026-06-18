import {
  type MessageRateLimitPolicy,
  type SentinelActivityAction,
  SentinelActionResult,
  SentinelActivityTargetType,
  SentinelDecision,
  defaultMessageRateLimitPolicy,
} from '@logto/schemas';
import { generateStandardId, parsePhoneNumber } from '@logto/shared';
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
 * Canonicalizes a recipient so casing/formatting variants of the same address share one rate-limit
 * bucket — otherwise the per-recipient cap is trivially bypassed by re-casing an email or
 * reformatting a phone number. Emails are lower-cased; everything else is treated as a phone number
 * and reduced to its E.164 digits (the form Logto stores), falling back to the trimmed input when
 * it is not a valid number.
 */
const normalizeRecipient = (recipient: string): string => {
  const trimmed = recipient.trim();
  // Email is the only messaging recipient that contains `@`; anything else is a phone number.
  return trimmed.includes('@') ? trimmed.toLowerCase() : parsePhoneNumber(trimmed);
};

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
    const targetHash = await sha256(normalizeRecipient(recipient));
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
      // Dedicated code (not the generic `request.rate_limited`) so a send throttle is distinctly
      // identifiable in the audit log and to API consumers, mirroring the verify-time lockout's
      // own `session.verification_blocked_too_many_attempts`.
      throw new RequestError({ code: 'request.message_rate_limited', status: 429 });
    }
  }

  /** Record a successful send so it counts toward the recipient's cap. */
  async record(action: SentinelActivityAction, recipient: string): Promise<void> {
    const targetHash = await sha256(normalizeRecipient(recipient));
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
  {
    action,
    recipient,
    onRateLimited,
  }: {
    action: SentinelActivityAction;
    recipient: string;
    /**
     * Invoked when the guard rejects the send as over the per-recipient cap, just before the 429 is
     * rethrown. End-user-facing routes use it to emit the `Message.RateLimited` exception hook
     * context; callers without a request context (e.g. library-level senders) omit it.
     */
    onRateLimited?: () => void;
  },
  send: () => Promise<T>
): Promise<T> => {
  try {
    await guard.guard(action, recipient);
  } catch (error) {
    // Only the per-recipient cap rejection (a 429) is an abuse signal; don't emit the hook for an
    // unexpected error from the guard, which would be a false `Message.RateLimited` event.
    if (error instanceof RequestError && error.status === 429) {
      onRateLimited?.();
    }
    throw error;
  }

  const result = await send();
  await guard.record(action, recipient);

  return result;
};
