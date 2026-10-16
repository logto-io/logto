import type { User } from '@logto/schemas';
import type { ExtendableContext } from 'koa';

import RequestError from '#src/errors/RequestError/index.js';
import type { WithAuthContext } from '#src/middleware/koa-auth/types.js';
import assertThat from '#src/utils/assert-that.js';

import { hasSecurityVerificationMethod } from './has-security-verification-method.js';

/** The context of an Account API operation that requires recent user authentication. */
type IdentityVerificationContext = WithAuthContext & ExtendableContext;

/**
 * Assert that the request carries recent user authentication, as `koaOidcAuth` recorded it: a valid
 * `logto-verification-id` verification record. The failure keeps the existing status and JSON body.
 */
export const assertIdentityVerified = (ctx: IdentityVerificationContext) => {
  assertThat(
    ctx.auth.identityVerified,
    new RequestError({ code: 'verification_record.permission_denied', status: 401 })
  );
};

/**
 * {@link assertIdentityVerified} for routes that only require it when the user has a security
 * verification method to re-authenticate with; a user with none may set a first one, or is not
 * asked for a proof it cannot provide.
 */
export const assertIdentityVerifiedIfRequired = (
  ctx: IdentityVerificationContext,
  user: Pick<User, 'passwordEncrypted' | 'primaryEmail' | 'primaryPhone'>
) => {
  if (!hasSecurityVerificationMethod(user)) {
    return;
  }

  assertIdentityVerified(ctx);
};
