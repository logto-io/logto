import type { MiddlewareType } from 'koa';

import RequestError from '#src/errors/RequestError/index.js';
import assertThat from '#src/utils/assert-that.js';

import { experienceRoutes } from '../const.js';
import { type ExperienceInteractionRouterContext } from '../types.js';

/**
 * The routes a pure step-up may reach, keyed on the interaction mode and the request path;
 * everything else fails with 403 `session.step_up.forbidden_route`. A SignIn with a requested ACR
 * is not a pure step-up and is never restricted.
 *
 * The enrollment, establishment, and subject-proof rows land with M5.
 */
const allowedStepUpRoutes = new Set([
  `GET ${experienceRoutes.interaction}`,
  `POST ${experienceRoutes.prefix}/submit`,
  `POST ${experienceRoutes.identification}`,
  `POST ${experienceRoutes.verification}/password`,
  `POST ${experienceRoutes.verification}/verification-code`,
  `POST ${experienceRoutes.verification}/verification-code/verify`,
  `POST ${experienceRoutes.verification}/mfa-verification-code`,
  `POST ${experienceRoutes.verification}/mfa-verification-code/verify`,
  `POST ${experienceRoutes.verification}/totp/verify`,
  `POST ${experienceRoutes.verification}/backup-code/verify`,
  `POST ${experienceRoutes.verification}/web-authn/authentication`,
  `POST ${experienceRoutes.verification}/web-authn/authentication/verify`,
]);

/**
 * Deny-by-default route guard for pure step-up interactions. Whitelisted routes of
 * `koaExperienceInteraction` carry no interaction and therefore can never be a pure step-up.
 */
export default function koaStepUpRouteGuard<
  StateT,
  ContextT extends ExperienceInteractionRouterContext,
  ResponseT,
>(): MiddlewareType<StateT, ContextT, ResponseT> {
  return async (ctx, next) => {
    const { experienceInteraction } = ctx;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- whitelisted routes have no interaction
    if (!experienceInteraction?.isStepUp) {
      return next();
    }

    assertThat(
      allowedStepUpRoutes.has(`${ctx.method.toUpperCase()} ${ctx.path}`),
      new RequestError({ code: 'session.step_up.forbidden_route', status: 403 })
    );

    return next();
  };
}
