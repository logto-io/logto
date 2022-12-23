import type { SignInExperience } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import type { MiddlewareType } from 'koa';

import { getSignInExperienceForApplication } from '#src/libraries/sign-in-experience/index.js';

import type { WithInteractionDetailsContext } from './koa-interaction-details.js';

export type WithInteractionSieContext<ContextT> = WithInteractionDetailsContext<ContextT> & {
  signInExperience: SignInExperience;
};

export default function koaInteractionSie<StateT, ContextT, ResponseT>(): MiddlewareType<
  StateT,
  WithInteractionSieContext<ContextT>,
  ResponseT
> {
  return async (ctx, next) => {
    const { interactionDetails } = ctx;

    const signInExperience = await getSignInExperienceForApplication(
      conditional(
        typeof interactionDetails.params.client_id === 'string' &&
          interactionDetails.params.client_id
      )
    );

    ctx.signInExperience = signInExperience;

    return next();
  };
}
