import { z } from 'zod';

import { type ToZodObject } from '../utils/zod.js';

/**
 * System-level rate-limit policy for outbound messages (verification codes and
 * other notifications) over email/SMS.
 *
 * This is intentionally separate from `SentinelPolicy`: the sentinel throttles
 * *failed verification attempts* and is tenant-configurable (a paid security
 * feature), whereas this throttles *successful sends* and is mandatory and
 * system-level — it is not exposed for tenant editing.
 *
 * Note: a per-send cooldown is intentionally omitted here. The experience app
 * already enforces a client-side resend cooldown, and the windowed per-recipient
 * cap below bounds abuse for non-UI callers without risking a server/client
 * cooldown mismatch that could reject a legitimate resend.
 */
export type MessageRateLimitPolicy = {
  /** Rolling window, in seconds, over which the per-recipient cap is counted. */
  sendWindow: number;
  /** Maximum number of sends to the same recipient within `sendWindow`. */
  maxSendsPerRecipient: number;
};

export const messageRateLimitPolicyGuard = z.object({
  sendWindow: z.number().int().positive(),
  maxSendsPerRecipient: z.number().int().positive(),
}) satisfies ToZodObject<MessageRateLimitPolicy>;

/**
 * The default message rate limit policy. Applied to every tenant and not
 * tenant-configurable.
 *
 * - `sendWindow`: 3600 seconds (1 hour)
 * - `maxSendsPerRecipient`: 5 per window
 */
export const defaultMessageRateLimitPolicy = Object.freeze({
  sendWindow: 3600,
  maxSendsPerRecipient: 5,
} satisfies MessageRateLimitPolicy);
