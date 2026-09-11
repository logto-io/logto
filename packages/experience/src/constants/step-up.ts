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
