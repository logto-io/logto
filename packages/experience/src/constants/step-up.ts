import { type LogtoErrorCode } from '@logto/phrases';
import { experience } from '@logto/schemas';

import { type VerificationCodeIdentifier } from '@/types';

/**
 * The pages of the `/step-up` route tree. The landing runs the server-driven dispatch, and the
 * pinned-user first-factor pages verify the pinned subject's password or primary email / phone
 * code. A sign-in with requested ACR reaches the same pages through the landing, which
 * `session.step_up.require_verification` navigates to.
 */
export const stepUpRoutes = Object.freeze({
  landing: `/${experience.routes.stepUp}`,
  password: `/${experience.routes.stepUp}/password`,
  verificationCode: `/${experience.routes.stepUp}/verification-code`,
});

/**
 * The pinned-user code page of one identifier type. The type rides in the path rather than in
 * `location.state`, so a refresh recovers the page the user is on; the code itself is addressed
 * by the verification ID the send stored, and the raw identifier never appears here.
 */
export const getStepUpVerificationCodeRoute = (type: VerificationCodeIdentifier) =>
  `${stepUpRoutes.verificationCode}/${type}`;

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
