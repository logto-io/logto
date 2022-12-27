import { InteractionEvent } from '@logto/schemas';

import { UserFlow } from '@/types';

import type { SendPasscodePayload } from './interaction';
import { putInteraction, sendPasscode } from './interaction';

export const getSendPasscodeApi = (type: UserFlow) => async (payload: SendPasscodePayload) => {
  if (type === UserFlow.forgotPassword) {
    await putInteraction(InteractionEvent.ForgotPassword);
  }

  if (type === UserFlow.signIn) {
    await putInteraction(InteractionEvent.SignIn);
  }

  if (type === UserFlow.register) {
    await putInteraction(InteractionEvent.Register);
  }

  return sendPasscode(payload);
};
