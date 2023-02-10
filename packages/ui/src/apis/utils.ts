import { InteractionEvent } from '@logto/schemas';

import { UserFlow } from '@/types';

import type { SendVerificationCodePayload } from './interaction';
import { putInteraction, sendVerificationCode } from './interaction';

/** Move to API */
export const sendVerificationCodeApi = async (
  type: UserFlow,
  payload: SendVerificationCodePayload
) => {
  if (type === UserFlow.forgotPassword) {
    await putInteraction(InteractionEvent.ForgotPassword);
  }

  if (type === UserFlow.signIn) {
    await putInteraction(InteractionEvent.SignIn);
  }

  if (type === UserFlow.register) {
    await putInteraction(InteractionEvent.Register);
  }

  return sendVerificationCode(payload);
};
