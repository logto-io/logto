import {
  validateUsernameAgainstPolicy,
  validateUsernameHardFloor,
  type UsernameViolation,
} from '@logto/core-kit';
import { type UsernamePolicy } from '@logto/schemas';

import type { ErrorType } from '@/shared/components/ErrorMessage';

const violationToErrorType: Readonly<
  Record<Exclude<UsernameViolation, 'too_short' | 'too_long'>, ErrorType>
> = Object.freeze({
  required: 'username_required',
  starts_with_number: 'username_should_not_start_with_number',
  invalid_charset_hard: 'username_invalid_charset',
  uppercase_not_allowed: 'username_uppercase_not_allowed',
  lowercase_not_allowed: 'username_lowercase_not_allowed',
  numbers_not_allowed: 'username_numbers_not_allowed',
  underscore_not_allowed: 'username_underscore_not_allowed',
});

/**
 * Keep in sync with the policy-driven members of {@link UsernameViolation}; `violationToErrorType`
 * above is exhaustive over the union, so a new violation type fails the build there first and must
 * be classified here at the same time.
 */
const policyViolationErrorCodes: ReadonlySet<string> = new Set([
  'username_too_short',
  'username_too_long',
  'username_uppercase_not_allowed',
  'username_lowercase_not_allowed',
  'username_numbers_not_allowed',
  'username_underscore_not_allowed',
]);

/**
 * Whether the validation error is a per-tenant policy violation, as opposed to the always-on hard
 * floor (non-empty, no leading digit, valid charset). Consumers that show no upfront policy
 * description can swap policy violations for the full requirements sentence, while hard-floor
 * violations stay specific — the requirements sentence does not describe the hard floor.
 */
export const isUsernamePolicyViolation = (error: ErrorType): boolean =>
  policyViolationErrorCodes.has(typeof error === 'string' ? error : error.code);

/**
 * Validate a username for the experience UI.
 *
 * Without a policy, only the always-on hard floor is applied (non-empty, no leading digit, valid
 * charset). Sign-in and forgot-password flows use this form so an existing username stays usable
 * even after the tenant tightens its policy. When a policy is provided (username creation flows),
 * the full per-tenant policy is enforced to mirror the server-side checks from the write path.
 */
export const validateUsername = (
  username: string,
  policy?: UsernamePolicy
): ErrorType | undefined => {
  const violation = policy
    ? validateUsernameAgainstPolicy(username, policy)
    : validateUsernameHardFloor(username);

  if (!violation) {
    return undefined;
  }

  if (violation === 'too_short') {
    return { code: 'username_too_short', data: { min: policy?.minLength } };
  }

  if (violation === 'too_long') {
    return { code: 'username_too_long', data: { max: policy?.maxLength } };
  }

  return violationToErrorType[violation];
};
