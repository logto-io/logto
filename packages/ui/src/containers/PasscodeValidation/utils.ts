import { SignInIdentifier } from '@logto/schemas';

import { UserFlow } from '@/types';

import useContinueSetEmailPasscodeValidation from './use-continue-set-email-passcode-validation';
import useContinueSetPhonePasscodeValidation from './use-continue-set-phone-passcode-validation';
import useForgotPasswordEmailPasscodeValidation from './use-forgot-password-email-passcode-validation';
import useForgotPasswordPhonePasscodeValidation from './use-forgot-password-phone-passcode-validation';
import useRegisterWithEmailPasscodeValidation from './use-register-with-email-passcode-validation';
import useRegisterWithPhonePasscodeValidation from './use-register-with-phone-passcode-validation';
import useSignInWithEmailPasscodeValidation from './use-sign-in-with-email-passcode-validation';
import useSignInWithPhonePasscodeValidation from './use-sign-in-with-phone-passcode-validation';

export const getPasscodeValidationHook = (
  type: UserFlow,
  method: SignInIdentifier.Email | SignInIdentifier.Phone
) => {
  switch (type) {
    case UserFlow.signIn:
      return method === SignInIdentifier.Email
        ? useSignInWithEmailPasscodeValidation
        : useSignInWithPhonePasscodeValidation;
    case UserFlow.register:
      return method === SignInIdentifier.Email
        ? useRegisterWithEmailPasscodeValidation
        : useRegisterWithPhonePasscodeValidation;
    case UserFlow.forgotPassword:
      return method === SignInIdentifier.Email
        ? useForgotPasswordEmailPasscodeValidation
        : useForgotPasswordPhonePasscodeValidation;
    default:
      return method === SignInIdentifier.Email
        ? useContinueSetEmailPasscodeValidation
        : useContinueSetPhonePasscodeValidation;
  }
};
