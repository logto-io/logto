import { InteractionEvent } from '@logto/schemas';

import { UserFlow } from '@/types';

import type { SendVerificationCodePayload } from './interaction';
import { putInteraction, sendVerificationCode } from './interaction';

/** Move to API */
export const sendVerificationCodeApi = async (
  type: UserFlow,
  payload: SendVerificationCodePayload
) => {
  if (type === UserFlow.ForgotPassword) {
    await putInteraction(InteractionEvent.ForgotPassword);
  }

  if (type === UserFlow.SignIn) {
    await putInteraction(InteractionEvent.SignIn);
  }

  if (type === UserFlow.Register) {
    await putInteraction(InteractionEvent.Register);
  }

  return sendVerificationCode(payload);
};
