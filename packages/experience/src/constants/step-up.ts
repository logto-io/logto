import { type LogtoErrorCode } from '@logto/phrases';
import { experience } from '@logto/schemas';

/**
 * The pages of the `/step-up` route tree. The landing runs the server-driven dispatch; the
 * pinned-user first-factor pages are registered by the slices that implement them, and they are
 * also where `session.step_up.require_verification` sends a sign-in with requested ACR.
 */
export const stepUpRoutes = Object.freeze({
  landing: `/${experience.routes.stepUp}`,
  password: `/${experience.routes.stepUp}/password`,
  verificationCode: `/${experience.routes.stepUp}/verification-code`,
});

/** The route that renders the invalid-session error page (registered in `App.tsx`). */
export const unknownSessionRoute = '/unknown-session';

/**
 * The errors that mean the OIDC interaction, the step-up interaction, or the subject it pins is
 * gone. Nothing on the client can recover from them: the guard and the step-up error handlers
 * both land on the invalid-session page, and the guard shows no toast for them.
 */
export const stepUpSessionGoneErrorCodes = Object.freeze([
  'session.not_found',
  'session.interaction_not_found',
  'session.step_up.subject_not_found',
  'session.step_up.invalid_interaction_event',
] as const satisfies readonly LogtoErrorCode[]);
