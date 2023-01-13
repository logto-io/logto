import { InteractionEvent } from '@logto/schemas';

import { UserFlow } from '@/types';

import type { SendVerificationCodePayload } from './interaction';
import { putInteraction, sendVerificationCode } from './interaction';

export const getSendVerificationCodeApi =
  (type: UserFlow) => async (payload: SendVerificationCodePayload) => {
    if (type === UserFlow.forgotPassword) {
      await putInteraction(InteractionEvent.ForgotPassword);
    }

    // Init a new interaction only if the user is not binding with a social
    if (type === UserFlow.signIn) {
      await putInteraction(InteractionEvent.SignIn);
    }

    if (type === UserFlow.register) {
      await putInteraction(InteractionEvent.Register);
    }

    return sendVerificationCode(payload);
  };
