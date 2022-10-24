import type { UserFlow } from '@/types';

import useForgotPasswordWithEmailErrorHandler from './use-forgot-password-with-email-error-handler';
import useForgotPasswordWithSmsErrorHandler from './use-forgot-password-with-sms-error-handler';
import useRegisterWithSmsErrorHandler from './use-register-with-sms-error-handler';
import useSignInWithEmailErrorHandler from './use-sign-in-with-email-error-handler';
import useSignInWithSmsErrorHandler from './use-sign-in-with-sms-error-handler';
import useRegisterWithEmailErrorHandler from './user-register-with-email-error-handler';

type Method = 'email' | 'sms';

const getPasscodeValidationErrorHandlersByFlowAndMethod = (flow: UserFlow, method: Method) => {
  if (flow === 'sign-in' && method === 'email') {
    return useSignInWithEmailErrorHandler;
  }

  if (flow === 'sign-in' && method === 'sms') {
    return useSignInWithSmsErrorHandler;
  }

  if (flow === 'register' && method === 'email') {
    return useRegisterWithEmailErrorHandler;
  }

  if (flow === 'register' && method === 'sms') {
    return useRegisterWithSmsErrorHandler;
  }

  if (flow === 'forgot-password' && method === 'email') {
    return useForgotPasswordWithEmailErrorHandler;
  }

  return useForgotPasswordWithSmsErrorHandler;
};

const usePasscodeValidationErrorHandler = (type: UserFlow, method: Method, target: string) => {
  const useFlowErrorHandler = getPasscodeValidationErrorHandlersByFlowAndMethod(type, method);
  const { errorHandler } = useFlowErrorHandler(target);

  return { errorHandler };
};

export default usePasscodeValidationErrorHandler;
