import type { SignInExperience } from '@logto/schemas';
import { SignInMode } from '@logto/schemas';
import type { MiddlewareType, Context } from 'koa';
import type { Provider } from 'oidc-provider';

import RequestError from '#src/errors/RequestError/index.js';
import { getSignInExperienceForApplication } from '#src/lib/sign-in-experience/index.js';
import assertThat from '#src/utils/assert-that.js';

import type { WithGuardedIdentifierPayloadContext } from './koa-interaction-body-guard.js';

const forbiddenEventError = new RequestError({ code: 'auth.forbidden', status: 403 });

export type WithSignInExperienceContext<ContextT> = ContextT & {
  signInExperience: SignInExperience;
};

export default function koaSessionSignInExperienceGuard<
  StateT,
  ContextT extends WithSignInExperienceContext<WithGuardedIdentifierPayloadContext<Context>>,
  ResponseBodyT
>(provider: Provider): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  return async (ctx, next) => {
    const interaction = await provider.interactionDetails(ctx.req, ctx.res);
    const { event } = ctx.interactionPayload;

    const signInExperience = await getSignInExperienceForApplication(
      typeof interaction.params.client_id === 'string' ? interaction.params.client_id : undefined
    );

    // SignInMode validation
    if (event === 'sign-in') {
      assertThat(signInExperience.signInMode !== SignInMode.Register, forbiddenEventError);
    }

    if (event === 'register') {
      assertThat(signInExperience.signInMode !== SignInMode.SignIn, forbiddenEventError);
    }

    ctx.signInExperience = signInExperience;

    return next();
  };
}
