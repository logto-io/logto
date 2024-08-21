import { InteractionEvent, type VerificationCodeIdentifier } from '@logto/schemas';

import { type ContinueFlowInteractionEvent, UserFlow } from '@/types';

import { initInteraction, sendVerificationCode } from './experience';

/** Move to API */
export const sendVerificationCodeApi = async (
  type: UserFlow,
  identifier: VerificationCodeIdentifier,
  interactionEvent?: ContinueFlowInteractionEvent
) => {
  switch (type) {
    case UserFlow.SignIn: {
      await initInteraction(InteractionEvent.SignIn);
      return sendVerificationCode(InteractionEvent.SignIn, identifier);
    }
    case UserFlow.Register: {
      await initInteraction(InteractionEvent.Register);
      return sendVerificationCode(InteractionEvent.Register, identifier);
    }
    case UserFlow.ForgotPassword: {
      await initInteraction(InteractionEvent.ForgotPassword);
      return sendVerificationCode(InteractionEvent.ForgotPassword, identifier);
    }
    case UserFlow.Continue: {
      return sendVerificationCode(interactionEvent ?? InteractionEvent.SignIn, identifier);
    }
  }
};

export const resendVerificationCodeApi = async (
  type: UserFlow,
  identifier: VerificationCodeIdentifier
) => {
  switch (type) {
    case UserFlow.SignIn: {
      return sendVerificationCode(InteractionEvent.SignIn, identifier);
    }
    case UserFlow.Register: {
      return sendVerificationCode(InteractionEvent.Register, identifier);
    }
    case UserFlow.ForgotPassword: {
      return sendVerificationCode(InteractionEvent.ForgotPassword, identifier);
    }
    case UserFlow.Continue: {
      // Continue flow does not have its own email template, always use sign-in template for now
      return sendVerificationCode(InteractionEvent.SignIn, identifier);
    }
  }
};
