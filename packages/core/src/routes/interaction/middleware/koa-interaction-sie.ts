import type { SignInExperience } from '@logto/schemas';
import type { MiddlewareType } from 'koa';

import type Queries from '#src/tenants/Queries.js';

import type { WithInteractionDetailsContext } from './koa-interaction-details.js';

export type WithInteractionSieContext<ContextT> = WithInteractionDetailsContext<ContextT> & {
  signInExperience: SignInExperience;
};

export default function koaInteractionSie<StateT, ContextT, ResponseT>({
  signInExperiences: { findDefaultSignInExperience },
}: Queries): MiddlewareType<StateT, WithInteractionSieContext<ContextT>, ResponseT> {
  return async (ctx, next) => {
    const signInExperience = await findDefaultSignInExperience();

    ctx.signInExperience = signInExperience;

    return next();
  };
}
