import type { User } from '@logto/schemas';
import type { ExtendableContext } from 'koa';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { buildInsufficientUserAuthenticationChallenge } from '#src/middleware/koa-auth/authentication-context.js';
import type { WithAuthContext } from '#src/middleware/koa-auth/types.js';
import assertThat from '#src/utils/assert-that.js';

import { hasSecurityVerificationMethod } from './has-security-verification-method.js';

/** The context of an Account API operation that requires recent user authentication. */
type IdentityVerificationContext = WithAuthContext & ExtendableContext;

/**
 * Assert that the request carries recent user authentication, as `koaOidcAuth` recorded it: a
 * qualifying OIDC authentication context on the access token, or a valid `logto-verification-id`
 * verification record. Throws a 401 `verification_record.permission_denied` error otherwise.
 *
 * A first-party caller also gets the RFC 9470 challenge with the error: a third-party application
 * can neither reach a step-up for this user nor gain Account API permissions, so it must not be
 * sent through a reauthentication it cannot complete.
 */
export const assertIdentityVerified = (ctx: IdentityVerificationContext) => {
  if (
    EnvSet.values.isDevFeaturesEnabled &&
    !ctx.auth.identityVerified &&
    ctx.auth.isFirstPartyClient
  ) {
    ctx.set('WWW-Authenticate', buildInsufficientUserAuthenticationChallenge());
  }

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
