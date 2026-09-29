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
 * The MFA enrollment routes: open once the interaction proved or established a fresh first factor
 * (`hasFreshFirstFactor`), the same predicate that decides whether an enrolled factor counts when
 * the step-up is submitted.
 */
const enrollmentRoutes = new Set([
  `POST ${experienceRoutes.verification}/totp/secret`,
  `POST ${experienceRoutes.verification}/backup-code/generate`,
  `POST ${experienceRoutes.verification}/web-authn/registration`,
  `POST ${experienceRoutes.verification}/web-authn/registration/verify`,
  `POST ${experienceRoutes.mfa}`,
  `POST ${experienceRoutes.mfa}/mfa-enabled`,
]);

/**
 * `POST /profile`: open while there is a first factor to establish. Which type may be staged is
 * checked by the route itself against the same list, since only the route parses the body.
 */
const establishmentRoute = `POST ${experienceRoutes.profile}`;

/** The social / SSO verification routes, which a pure step-up only accepts as subject proof. */
const subjectProofRoutePattern = new RegExp(
  `^${experienceRoutes.verification}/(social|sso)/([^/]+)/(authorization-uri|verify)$`,
  'i'
);

/**
 * Deny-by-default route guard for pure step-up interactions. The mode comes from the
 * `ctx.experienceInteraction` instance wherever one exists; the three routes
 * `koaExperienceInteraction` whitelists carry none, so they are classified from the interaction
 * record `koaInteractionDetails` provides.
 *
 * The conditional rows are gated by the predicates and lists the step-up eligibility computes from
 * the proofs of this interaction alone, so a session cookie can neither enroll nor establish
 * anything, and a route is open exactly when the list it serves is.
 */
export default function koaStepUpRouteGuard<
  StateT,
  ContextT extends ExperienceInteractionRouterContext,
  ResponseT,
>(): MiddlewareType<StateT, ContextT, ResponseT> {
  return async (ctx, next) => {
    const { experienceInteraction } = ctx;
    // The instance is the single source of the mode, so the guard does not re-parse the storage on
    // the routes that have one.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- absent on the routes `koaExperienceInteraction` whitelists
    const isStepUp = experienceInteraction
      ? experienceInteraction.isStepUp
      : isStepUpInteractionDetails(ctx.interactionDetails);

    if (!isStepUp) {
      return next();
    }

    // Mirror the router's default normalization so an allow-listed route is not denied by its
    // spelling: koa-router matches case-insensitively and tolerates a trailing slash.
    const originalPath = ctx.path.replace(/\/$/, '');
    const route = `${ctx.method.toUpperCase()} ${originalPath.toLowerCase()}`;

    if (allowedStepUpRoutes.has(route)) {
      return next();
    }

    const forbidden = new RequestError({ code: 'session.step_up.forbidden_route', status: 403 });

    // Only the whitelisted routes carry no instance, and none of them is a conditional row.

    assertThat(experienceInteraction, forbidden);

    if (enrollmentRoutes.has(route)) {
      assertThat(experienceInteraction.hasFreshFirstFactor, forbidden);
      return next();
    }

    const subjectProofMatch =
      ctx.method.toUpperCase() === 'POST' ? subjectProofRoutePattern.exec(originalPath) : null;

    if (route === establishmentRoute || subjectProofMatch) {
      const eligibility = await experienceInteraction.getStepUpEligibility();

      if (route === establishmentRoute) {
        assertThat((eligibility?.establishableMethods.length ?? 0) > 0, forbidden);
        return next();
      }

      const [, type, connectorId] = subjectProofMatch ?? [];
      assertThat(
        eligibility?.subjectProofConnectors.some(
          (connector) =>
            connector.type === type?.toLowerCase() && connector.connectorId === connectorId
        ),
        forbidden
      );
      return next();
    }

    throw forbidden;
  };
}
