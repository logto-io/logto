import {
  InteractionEvent,
  type InteractionAuthenticationContext,
  interactionAuthenticationContextGuard,
} from '@logto/schemas';

import { type VerificationCodeIdentifier } from '@/types';

import api from '../api';

import { experienceApiRoutes, type VerificationResponse } from './const';

type StepUpInitResult = {
  /**
   * Present when the step-up cannot proceed: Core finished the interaction with
   * `unmet_authentication_requirements` and the client is sent back to the application.
   */
  redirectTo?: string;
};

/**
 * Create the step-up interaction with `PUT /experience { interactionEvent: SignIn }`. Core
 * detects the step-up from the login prompt details and pins the subject from the OIDC session;
 * the SPA sends nothing that identifies the user.
 *
 * Resolves with `{}` on 204 (the interaction proceeds), or with `{ redirectTo }` on 200.
 */
export const initStepUp = async (): Promise<StepUpInitResult> => {
  const response = await api.put(experienceApiRoutes.prefix, {
    json: { interactionEvent: InteractionEvent.SignIn },
  });

  return response.status === 200 ? response.json<Required<StepUpInitResult>>() : {};
};

type InteractionResponse = {
  authenticationContext?: unknown;
};

/**
 * Read the authoritative step-up state from `GET /experience/interaction`: the selected class,
 * the methods that can still contribute to it, and the masked identifiers. Resolves with
 * `undefined` when the interaction carries no authentication context or the payload is malformed.
 */
export const getStepUpContext = async (): Promise<InteractionAuthenticationContext | undefined> => {
  const { authenticationContext } = await api
    .get(experienceApiRoutes.interaction)
    .json<InteractionResponse>();
  const result = interactionAuthenticationContextGuard.safeParse(authenticationContext);

  return result.success ? result.data : undefined;
};

/**
 * Send a verification code to the pinned subject's primary email or phone. Only the identifier
 * type is sent: Core resolves the value from the subject, and the raw identifier never reaches
 * the browser.
 */
export const sendStepUpVerificationCode = async (type: VerificationCodeIdentifier) =>
  api
    .post(`${experienceApiRoutes.verification}/verification-code`, {
      json: { interactionEvent: InteractionEvent.SignIn, identifier: { type } },
    })
    .json<VerificationResponse>();
