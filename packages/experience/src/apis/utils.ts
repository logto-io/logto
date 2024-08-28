import { InteractionEvent, type VerificationCodeIdentifier } from '@logto/schemas';
import { validate } from 'superstruct';

import { type ContinueFlowInteractionEvent, UserFlow } from '@/types';
import { continueFlowStateGuard } from '@/types/guard';

import { initInteraction, sendVerificationCode } from './experience';

// Consider deprecate this, remove the `UserFlow.Continue` case
// Align the flow definition with the interaction event
export const userFlowToInteractionEventMap = Object.freeze({
  [UserFlow.SignIn]: InteractionEvent.SignIn,
  [UserFlow.Register]: InteractionEvent.Register,
  [UserFlow.ForgotPassword]: InteractionEvent.ForgotPassword,
});

/**
 * This method is used to get the interaction event from the location state
 * For continue flow, the interaction event is stored in the location state,
 * we need to retrieve it from the state in order to send the verification code with the correct interaction event template
 */
export const getInteractionEventFromState = (state: unknown) => {
  if (!state) {
    return;
  }

  const [, continueFlowState] = validate(state, continueFlowStateGuard);

  return continueFlowState?.interactionEvent;
};

export const sendVerificationCodeApi = async (
  flow: UserFlow,
  identifier: VerificationCodeIdentifier,
  interactionEvent?: ContinueFlowInteractionEvent
) => {
  if (flow === UserFlow.Continue) {
    return sendVerificationCode(interactionEvent ?? InteractionEvent.SignIn, identifier);
  }

  const event = userFlowToInteractionEventMap[flow];
  await initInteraction(event);
  return sendVerificationCode(event, identifier);
};
