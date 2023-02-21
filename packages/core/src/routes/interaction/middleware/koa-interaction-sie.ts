import type { SignInExperience } from '@logto/schemas';
import type { MiddlewareType } from 'koa';

import type { SignInExperienceLibrary } from '#src/libraries/sign-in-experience/index.js';

import type { WithInteractionDetailsContext } from './koa-interaction-details.js';

export type WithInteractionSieContext<ContextT> = WithInteractionDetailsContext<ContextT> & {
  signInExperience: SignInExperience;
};

export default function koaInteractionSie<StateT, ContextT, ResponseT>({
  getSignInExperience,
}: SignInExperienceLibrary): MiddlewareType<
  StateT,
  WithInteractionSieContext<ContextT>,
  ResponseT
> {
  return async (ctx, next) => {
    const signInExperience = await getSignInExperience();

    ctx.signInExperience = signInExperience;

    return next();
  };
}
