import { useMemo } from 'react';

import { type ErrorHandlers } from './use-error-handler';
import useMfaErrorHandler, {
  type Options as UseMfaVerificationErrorHandlerOptions,
} from './use-mfa-error-handler';
import useRequiredProfileErrorHandler, {
  type Options as UseRequiredProfileErrorHandlerOptions,
} from './use-required-profile-error-handler';

type Options = UseRequiredProfileErrorHandlerOptions & UseMfaVerificationErrorHandlerOptions;

const usePreSignInErrorHandler = ({ replace, linkSocial }: Options = {}): ErrorHandlers => {
  const requiredProfileErrorHandler = useRequiredProfileErrorHandler({ replace, linkSocial });
  const mfaErrorHandler = useMfaErrorHandler({ replace });

  return useMemo(
    () => ({
      ...requiredProfileErrorHandler,
      ...mfaErrorHandler,
    }),
    [mfaErrorHandler, requiredProfileErrorHandler]
  );
};

export default usePreSignInErrorHandler;
