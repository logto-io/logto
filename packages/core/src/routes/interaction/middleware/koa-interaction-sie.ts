import crypto from 'node:crypto';

import { PasswordPolicyChecker } from '@logto/core-kit';
import type { SignInExperience } from '@logto/schemas';
import type { MiddlewareType } from 'koa';
import { type IRouterParamContext } from 'koa-router';

import type Queries from '#src/tenants/Queries.js';

/**
 * Extend the context with the default sign-in experience and the corresponding
 * password policy checker.
 */
export type WithInteractionSieContext<ContextT extends IRouterParamContext = IRouterParamContext> =
  ContextT & { signInExperience: SignInExperience; passwordPolicyChecker: PasswordPolicyChecker };

/**
 * Create a middleware that injects the default sign-in experience and the
 * corresponding password policy checker into the context.
 */
export default function koaInteractionSie<StateT, ContextT extends IRouterParamContext, ResponseT>({
  signInExperiences: { findDefaultSignInExperience },
}: Queries): MiddlewareType<StateT, WithInteractionSieContext<ContextT>, ResponseT> {
  return async (ctx, next) => {
    const signInExperience = await findDefaultSignInExperience();

    ctx.signInExperience = signInExperience;
    ctx.passwordPolicyChecker = new PasswordPolicyChecker(
      signInExperience.passwordPolicy,
      crypto.subtle
    );

    return next();
  };
}
