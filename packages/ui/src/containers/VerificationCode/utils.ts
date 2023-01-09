import { SignInIdentifier } from '@logto/schemas';

import { UserFlow } from '@/types';

import useContinueSetEmailVerificationCode from './use-continue-set-email-verification-code-validation';
import useContinueSetPhoneVerificationCode from './use-continue-set-phone-verification-code-validation';
import useForgotPasswordEmailVerificationCode from './use-forgot-password-email-verification-code-validation';
import useForgotPasswordPhoneVerificationCode from './use-forgot-password-phone-verification-code-validation';
import useRegisterWithEmailVerificationCode from './use-register-with-email-verification-code-validation';
import useRegisterWithPhoneVerificationCode from './use-register-with-phone-verification-code-validation';
import useSignInWithEmailVerificationCode from './use-sign-in-with-email-verification-code-validation';
import useSignInWithPhoneVerificationCode from './use-sign-in-with-phone-verification-code-validation';

export const getVerificationCodeHook = (
  type: UserFlow,
  method: SignInIdentifier.Email | SignInIdentifier.Phone
) => {
  switch (type) {
    case UserFlow.signIn:
      return method === SignInIdentifier.Email
        ? useSignInWithEmailVerificationCode
        : useSignInWithPhoneVerificationCode;
    case UserFlow.register:
      return method === SignInIdentifier.Email
        ? useRegisterWithEmailVerificationCode
        : useRegisterWithPhoneVerificationCode;
    case UserFlow.forgotPassword:
      return method === SignInIdentifier.Email
        ? useForgotPasswordEmailVerificationCode
        : useForgotPasswordPhoneVerificationCode;
    default:
      return method === SignInIdentifier.Email
        ? useContinueSetEmailVerificationCode
        : useContinueSetPhoneVerificationCode;
  }
};
