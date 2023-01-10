import { UserFlow } from '@/types';

import useContinueFlowCodeVerification from './use-continue-flow-code-verification';
import useForgotPasswordFlowCodeVerification from './use-forgot-password-flow-code-verification';
import useRegisterFlowCodeVerification from './use-register-flow-code-verification';
import useSignInFlowCodeVerification from './use-sign-in-flow-code-verification';

export const codeVerificationHooks = Object.freeze({
  [UserFlow.signIn]: useSignInFlowCodeVerification,
  [UserFlow.register]: useRegisterFlowCodeVerification,
  [UserFlow.forgotPassword]: useForgotPasswordFlowCodeVerification,
  [UserFlow.continue]: useContinueFlowCodeVerification,
});

export const getCodeVerificationHookByFlow = (flow: UserFlow) => codeVerificationHooks[flow];
