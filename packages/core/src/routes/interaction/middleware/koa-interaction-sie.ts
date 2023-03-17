import type { SignInExperience } from '@logto/schemas';
import type { MiddlewareType } from 'koa';

import { wellKnownCache } from '#src/caches/well-known.js';
import type { SignInExperienceLibrary } from '#src/libraries/sign-in-experience/index.js';
import { noCache } from '#src/utils/request.js';

import type { WithInteractionDetailsContext } from './koa-interaction-details.js';

export type WithInteractionSieContext<ContextT> = WithInteractionDetailsContext<ContextT> & {
  signInExperience: SignInExperience;
};

export default function koaInteractionSie<StateT, ContextT, ResponseT>(
  { getSignInExperience }: SignInExperienceLibrary,
  tenantId: string
): MiddlewareType<StateT, WithInteractionSieContext<ContextT>, ResponseT> {
  return async (ctx, next) => {
    if (noCache(ctx.headers)) {
      wellKnownCache.invalidate(tenantId, ['sie']);
    }

    const signInExperience = await getSignInExperience();

    ctx.signInExperience = signInExperience;

    return next();
  };
}
