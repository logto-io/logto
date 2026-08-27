import type { VerificationCodeIdentifier } from '@logto/schemas';

import { UserFlow } from '@/types';

import useContinueFlowCodeVerification from './use-continue-flow-code-verification';
import useForgotPasswordFlowCodeVerification from './use-forgot-password-flow-code-verification';
import useRegisterFlowCodeVerification from './use-register-flow-code-verification';
import useSignInFlowCodeVerification from './use-sign-in-flow-code-verification';

type VerificationCodeHook = (
  identifier: VerificationCodeIdentifier,
  verificationId: string,
  errorCallback?: () => void,
  createTrustedDevice?: boolean
) => {
  errorMessage: string | undefined;
  clearErrorMessage: () => void;
  onSubmit: (code: string) => Promise<void>;
};

export const codeVerificationHooks: Readonly<Record<UserFlow, VerificationCodeHook>> =
  Object.freeze({
    [UserFlow.SignIn]: useSignInFlowCodeVerification,
    [UserFlow.Register]: useRegisterFlowCodeVerification,
    [UserFlow.ForgotPassword]: useForgotPasswordFlowCodeVerification,
    [UserFlow.Continue]: useContinueFlowCodeVerification,
  });

export const getCodeVerificationHookByFlow = (flow: UserFlow) => codeVerificationHooks[flow];
