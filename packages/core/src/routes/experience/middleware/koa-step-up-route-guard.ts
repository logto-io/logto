import type { MiddlewareType } from 'koa';

import RequestError from '#src/errors/RequestError/index.js';
import assertThat from '#src/utils/assert-that.js';

import { experienceRoutes } from '../const.js';
import type { ExperienceInteractionRouterContext } from '../types.js';

const allowedRoutes = new Set([
  `GET ${experienceRoutes.interaction}`,
  `POST ${experienceRoutes.prefix}/submit`,
  `POST ${experienceRoutes.identification}`,
  ...[
    'password',
    'verification-code',
    'verification-code/verify',
    'mfa-verification-code',
    'mfa-verification-code/verify',
    'totp/verify',
    'backup-code/verify',
    'web-authn/authentication',
    'web-authn/authentication/verify',
  ].map((path) => `POST ${experienceRoutes.verification}/${path}`),
]);

export default function koaStepUpRouteGuard<
  StateT,
  ContextT extends ExperienceInteractionRouterContext,
  ResponseT,
>(): MiddlewareType<StateT, ContextT, ResponseT> {
  return async (ctx, next) => {
    // Match the router's case-insensitive paths and optional trailing slash.
    const path = ctx.path.toLowerCase().replace(/\/$/, '');

    // Creation always re-derives the mode from the immutable login prompt.
    if (ctx.method === 'PUT' && path === experienceRoutes.prefix) {
      return next();
    }

    assertThat(
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Anonymous endpoints may have no stored interaction.
      !ctx.experienceInteraction?.isStepUp || allowedRoutes.has(`${ctx.method} ${path}`),
      new RequestError({ code: 'session.step_up.forbidden_route', status: 403 })
    );

    return next();
  };
}
