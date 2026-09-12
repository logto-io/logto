import type { MiddlewareType } from 'koa';

import RequestError from '#src/errors/RequestError/index.js';
import assertThat from '#src/utils/assert-that.js';

import { isStepUpInteractionDetails } from '../classes/experience-interaction.js';
import { experienceRoutes } from '../const.js';
import { type ExperienceInteractionRouterContext } from '../types.js';

/**
 * The routes a pure step-up may reach, keyed on the interaction mode and the request path;
 * everything else fails with 403 `session.step_up.forbidden_route`. A SignIn with a requested ACR
 * is not a pure step-up and is never restricted.
 *
 * `PUT /experience` stays reachable: it is how the interaction is created, and a re-mounted client
 * calls it again for the same step-up.
 *
 * The enrollment, establishment, and subject-proof rows land with M5.
 */
const allowedStepUpRoutes = new Set([
  `PUT ${experienceRoutes.prefix}`,
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
 * Deny-by-default route guard for pure step-up interactions. The mode comes from the
 * `ctx.experienceInteraction` instance wherever one exists; the three routes
 * `koaExperienceInteraction` whitelists carry none, so they are classified from the interaction
 * record `koaInteractionDetails` provides.
 */
export default function koaStepUpRouteGuard<
  StateT,
  ContextT extends ExperienceInteractionRouterContext,
  ResponseT,
>(): MiddlewareType<StateT, ContextT, ResponseT> {
  return async (ctx, next) => {
    // The instance is the single source of the mode, so the guard does not re-parse the storage on
    // the routes that have one.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- absent on the routes `koaExperienceInteraction` whitelists
    const isStepUp = ctx.experienceInteraction
      ? ctx.experienceInteraction.isStepUp
      : isStepUpInteractionDetails(ctx.interactionDetails);

    if (!isStepUp) {
      return next();
    }

    // Mirror the router's default normalization so an allow-listed route is not denied by its
    // spelling: koa-router matches case-insensitively and tolerates a trailing slash.
    const path = ctx.path.toLowerCase().replace(/\/$/, '');

    assertThat(
      allowedStepUpRoutes.has(`${ctx.method.toUpperCase()} ${path}`),
      new RequestError({ code: 'session.step_up.forbidden_route', status: 403 })
    );

    return next();
  };
}
