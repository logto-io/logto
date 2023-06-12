import { UserFlow } from '@/types';

import useContinueFlowCodeVerification from './use-continue-flow-code-verification';
import useForgotPasswordFlowCodeVerification from './use-forgot-password-flow-code-verification';
import useRegisterFlowCodeVerification from './use-register-flow-code-verification';
import useSignInFlowCodeVerification from './use-sign-in-flow-code-verification';

export const codeVerificationHooks = Object.freeze({
  [UserFlow.SignIn]: useSignInFlowCodeVerification,
  [UserFlow.Register]: useRegisterFlowCodeVerification,
  [UserFlow.ForgotPassword]: useForgotPasswordFlowCodeVerification,
  [UserFlow.Continue]: useContinueFlowCodeVerification,
});

export const getCodeVerificationHookByFlow = (flow: UserFlow) => codeVerificationHooks[flow];
