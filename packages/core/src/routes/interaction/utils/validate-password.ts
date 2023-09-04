import { type PasswordPolicyChecker } from '@logto/core-kit';
import { type Optional } from '@silverhand/essentials';

import RequestError from '#src/errors/RequestError/index.js';

/**
 * Validate password against the given password policy if the password is not undefined,
 * throw a {@link RequestError} if the password is invalid; otherwise, do nothing.
 */
export const validatePassword = async (
  password: Optional<string>,
  checker: PasswordPolicyChecker
) => {
  if (password === undefined) {
    return;
  }

  const issues = await checker.check(password, {});
  if (issues.length > 0) {
    throw new RequestError('password.password_rejected', issues);
  }
};
