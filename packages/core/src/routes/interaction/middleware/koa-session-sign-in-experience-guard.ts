import type { MiddlewareType } from 'koa';
import type { IRouterParamContext } from 'koa-router';
import type { Provider } from 'oidc-provider';

import { getSignInExperienceForApplication } from '#src/lib/sign-in-experience/index.js';

import {
  signInModeValidation,
  identifierValidation,
  profileValidation,
} from '../utils/sign-in-experience-validation.js';
import type { WithGuardedIdentifierPayloadContext } from './koa-interaction-body-guard.js';

export default function koaSessionSignInExperienceGuard<
  StateT,
  ContextT extends WithGuardedIdentifierPayloadContext<IRouterParamContext>,
  ResponseBodyT
>(provider: Provider): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  return async (ctx, next) => {
    const interaction = await provider.interactionDetails(ctx.req, ctx.res);
    const { event, identifier, profile } = ctx.interactionPayload;

    if (event === 'forgot-password') {
      return next();
    }

    const signInExperience = await getSignInExperienceForApplication(
      typeof interaction.params.client_id === 'string' ? interaction.params.client_id : undefined
    );

    signInModeValidation(event, signInExperience);

    if (identifier) {
      identifierValidation(identifier, signInExperience);
    }

    if (profile) {
      profileValidation(profile, signInExperience);
    }

    return next();
  };
}
