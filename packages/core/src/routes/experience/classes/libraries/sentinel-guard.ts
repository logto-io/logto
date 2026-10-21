import {
  AdditionalIdentifier,
  SentinelActionResult,
  SentinelActivityTargetType,
  SentinelDecision,
  SignInIdentifier,
  type VerificationIdentifier,
  type Sentinel,
  type SentinelActivityAction,
} from '@logto/schemas';
import { PhoneNumberParser } from '@logto/shared';
import { deduplicate } from '@silverhand/essentials';
import { sha256 } from 'hash-wasm';

import RequestError from '#src/errors/RequestError/index.js';
import { type WithI18nContext } from '#src/middleware/koa-i18next.js';
import { type WithHookContext } from '#src/middleware/koa-management-api-hooks.js';
import type Queries from '#src/tenants/Queries.js';
import { getConsoleLogFromContext } from '#src/utils/console.js';

/**
 * Resolves the identifier to the form the user lookup matches on, so that every spelling of one
 * account shares a single lockout bucket.
 *
 * @remarks
 * Each branch mirrors its counterpart in `findUserByIdentifier`
 * (`routes/experience/classes/utils.ts`), because the mirroring is what makes the bucket
 * per-account: normalizing less than the lookup lets an attacker mint a fresh bucket per spelling,
 * and normalizing more merges accounts the lookup keeps apart, so failed attempts against one lock
 * out another.
 *
 * The phone branch looks like it could merge two accounts, because `findUserByNormalizedPhone`
 * matches both the international and the leading-zero form but then disambiguates on the raw input.
 * It cannot: sharing a bucket needs both rows to canonicalize identically, which needs both to
 * parse, and a leading-zero form that parses is normalized to its canonical spelling on write, so
 * it never becomes a second row. One that does not parse falls through to the raw value here and
 * keeps its own bucket. The two conditions are mutually exclusive, so canonicalizing costs nothing
 * here, while keying on the raw value would reopen the bypass for every phone identifier.
 */
const resolveLockoutTarget = async (
  queries: Queries,
  { type, value }: VerificationIdentifier
): Promise<string> => {
  switch (type) {
    case SignInIdentifier.Email: {
      // `findUserByEmail` compares `lower(primary_email)` to `lower(input)`.
      return value.toLowerCase();
    }
    case SignInIdentifier.Phone: {
      // `internationalNumber` is undefined unless the value parses, mirroring where
      // `findUserByNormalizedPhone` falls back to the exact-match `findUserByPhone`.
      return new PhoneNumberParser(value).internationalNumber ?? value;
    }
    case SignInIdentifier.Username: {
      // Deliberately the same `getUsernameCaseSensitive()` call the lookup makes before passing the
      // flag to `findUserByUsername`, rather than a second copy of the rule — the two cannot drift.
      // It resolves the tenant policy AND-combined with the legacy `CASE_SENSITIVE_USERNAME` env
      // var, so an env-forced case-insensitive deployment folds here too. Under the default
      // case-sensitive policy `Alice` and `alice` are different accounts and keep separate buckets.
      // The sentinel already loads the sign-in experience for its own policy on this path, so this
      // reads through a warm cache.
      return (await queries.signInExperiences.getUsernameCaseSensitive())
        ? value
        : value.toLowerCase();
    }
    case AdditionalIdentifier.UserId: {
      return value;
    }
  }
};

/**
 * {@link resolveLockoutTarget}, degraded to the raw identifier value when it fails.
 *
 * @remarks
 * The username branch reads the sign-in experience, so resolution can reject on a database fault.
 * Letting that propagate would abort {@link withSentinel} after the credential has already been
 * checked, and an unreported attempt is an uncounted one — a free guess. Keying on the raw value
 * instead reproduces the pre-normalization bucketing for the duration of the fault, which is
 * degraded but still counts the attempt.
 */
const resolveLockoutTargetOrRaw = async (
  ctx: WithI18nContext & WithHookContext,
  queries: Queries,
  identifier: VerificationIdentifier
): Promise<string> => {
  try {
    return await resolveLockoutTarget(queries, identifier);
  } catch (error: unknown) {
    getConsoleLogFromContext(ctx).error(
      'Failed to resolve the sentinel lockout target, falling back to the raw identifier:',
      error
    );

    return identifier.value;
  }
};

/**
 * The lockout keys a bare identifier value could have been recorded under: the value as typed, its
 * canonical phone form, and — only where case folding cannot span two accounts — its lower-cased
 * form.
 *
 * @remarks
 * The management API unblocks by identifier value alone, without knowing the identifier type, so it
 * cannot call {@link resolveLockoutTarget} directly.
 *
 * Case is folded only when both spellings are guaranteed to be the same account, so an unblock can
 * never reach across to another one:
 *
 * - An email always folds, because the lookup matches it case-insensitively. `usernameRegEx`
 *   (`^[A-Z_a-z]\w*$`) admits no `@`, so a value containing one cannot be a username.
 * - Anything else folds only when the tenant's username policy is case-insensitive, where `Alice`
 *   and `alice` are one account. Under the default case-sensitive policy they are two, and the
 *   admin has to submit the spelling that tripped the lockout.
 *
 * Phone numbers and user IDs are unaffected either way: their alphabets have no uppercase, so the
 * lower-cased candidate collapses into the value as typed.
 */
export const getLockoutTargetCandidates = (value: string, foldCase: boolean): string[] => {
  // `internationalNumber` is undefined unless the value parses as a phone number, in which case that
  // candidate collapses into the first.
  const { internationalNumber } = new PhoneNumberParser(value);

  return deduplicate([value, foldCase ? value.toLowerCase() : value, internationalNumber ?? value]);
};

/** Whether folding this value's case can only ever reach the account it was submitted for. */
export const canFoldLockoutTargetCase = async (queries: Queries, value: string): Promise<boolean> =>
  value.includes('@') || !(await queries.signInExperiences.getUsernameCaseSensitive());

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
    queries,
    action,
    identifier,
    payload,
  }: {
    ctx: WithI18nContext & WithHookContext;
    sentinel: Sentinel;
    queries: Queries;
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
  // Resolved into its own statement rather than inline below: an exception while building
  // `reportActivity`'s argument would skip the call entirely, leaving this attempt uncounted.
  const targetHash = await sha256(await resolveLockoutTargetOrRaw(ctx, queries, identifier));

  const [decision, decisionExpiresAt] = await sentinel.reportActivity({
    targetType: SentinelActivityTargetType.User,
    targetHash,
    action,
    actionResult,
    payload,
  });

  if (decision === SentinelDecision.Blocked) {
    // Reported as typed, not as keyed — admins need to see the spelling that tripped the lockout.
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
