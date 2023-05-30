import type { SignInExperience } from '@logto/schemas';
import type { MiddlewareType } from 'koa';
import { type IRouterParamContext } from 'koa-router';

import type Queries from '#src/tenants/Queries.js';

export type WithInteractionSieContext<ContextT extends IRouterParamContext = IRouterParamContext> =
  ContextT & { signInExperience: SignInExperience };

export default function koaInteractionSie<StateT, ContextT extends IRouterParamContext, ResponseT>({
  signInExperiences: { findDefaultSignInExperience },
}: Queries): MiddlewareType<StateT, WithInteractionSieContext<ContextT>, ResponseT> {
  return async (ctx, next) => {
    const signInExperience = await findDefaultSignInExperience();

    ctx.signInExperience = signInExperience;

    return next();
  };
}
