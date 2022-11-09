import { SignInIdentifier } from '@logto/schemas';

import { UserFlow } from '@/types';

import useForgotPasswordEmailPasscodeValidation from './use-forgot-password-email-passcode-validation';
import useForgotPasswordSmsPasscodeValidation from './use-forgot-password-sms-passcode-validation';
import useRegisterWithEmailPasscodeValidation from './use-register-with-email-passcode-validation';
import useRegisterWithSmsPasscodeValidation from './use-register-with-sms-passcode-validation';
import useSignInWithEmailPasscodeValidation from './use-sign-in-with-email-passcode-validation';
import useSignInWithSmsPasscodeValidation from './use-sign-in-with-sms-passcode-validation';

export const getPasscodeValidationHook = (
  type: UserFlow,
  method: SignInIdentifier.Email | SignInIdentifier.Sms
) => {
  switch (type) {
    case UserFlow.signIn:
      return method === SignInIdentifier.Email
        ? useSignInWithEmailPasscodeValidation
        : useSignInWithSmsPasscodeValidation;
    case UserFlow.register:
      return method === SignInIdentifier.Email
        ? useRegisterWithEmailPasscodeValidation
        : useRegisterWithSmsPasscodeValidation;
    case UserFlow.forgotPassword:
      return method === SignInIdentifier.Email
        ? useForgotPasswordEmailPasscodeValidation
        : useForgotPasswordSmsPasscodeValidation;
    default:
      // TODO: continue flow hook
      return method === SignInIdentifier.Email
        ? useRegisterWithEmailPasscodeValidation
        : useRegisterWithSmsPasscodeValidation;
  }
};
