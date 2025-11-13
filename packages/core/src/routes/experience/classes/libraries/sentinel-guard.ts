import {
  SentinelActionResult,
  SentinelActivityTargetType,
  SentinelDecision,
  type VerificationIdentifier,
  type Sentinel,
  type SentinelActivityAction,
} from '@logto/schemas';
import { sha256 } from 'hash-wasm';

import RequestError from '#src/errors/RequestError/index.js';
import { type WithI18nContext } from '#src/middleware/koa-i18next.js';
import { type WithHookContext } from '#src/middleware/koa-management-api-hooks.js';

/**
 * Applies a sentinel guard to a verification promise.
 *
 * @remarks
 * If the user is blocked, the verification will still be performed, but the promise will be
 * rejected with a {@link RequestError} with the code `session.verification_blocked_too_many_attempts`.
 *
 * If the user is not blocked, but the verification throws, the promise will be rejected with
 * the error thrown by the verification.
 *
 * @throws {RequestError} If the user is blocked.
 * @throws original verification error if user is not blocked
 */
export async function withSentinel<T>(
  {
    ctx,
    sentinel,
    action,
    identifier,
    payload,
  }: {
    ctx: WithI18nContext & WithHookContext;
    sentinel: Sentinel;
    action: SentinelActivityAction;
    identifier: VerificationIdentifier;
    payload: Record<string, unknown>;
  },
  verificationPromise: Promise<T>
): Promise<T> {
  const [result, error] = await (async () => {
    try {
      return [await verificationPromise, undefined];
    } catch (error) {
      return [undefined, error instanceof Error ? error : new Error(String(error))];
    }
  })();

  const actionResult = error ? SentinelActionResult.Failed : SentinelActionResult.Success;

  const [decision, decisionExpiresAt] = await sentinel.reportActivity({
    targetType: SentinelActivityTargetType.User,
    targetHash: await sha256(identifier.value),
    action,
    actionResult,
    payload,
  });

  if (decision === SentinelDecision.Blocked) {
    ctx.appendExceptionHookContext('Identifier.Lockout', {
      ...identifier,
    });
    const rtf = new Intl.RelativeTimeFormat([...ctx.i18n.languages]);
    throw new RequestError({
      code: 'session.verification_blocked_too_many_attempts',
      relativeTime: rtf.format(Math.round((decisionExpiresAt - Date.now()) / 1000 / 60), 'minute'),
    });
  }

  if (error) {
    throw error;
  }

  return result;
}
