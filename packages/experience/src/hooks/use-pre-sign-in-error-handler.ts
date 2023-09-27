import { useMemo } from 'react';

import { type ErrorHandlers } from './use-error-handler';
import useMfaVerificationErrorHandler, {
  type Options as UseMfaVerificationErrorHandlerOptions,
} from './use-mfa-verification-error-handler';
import useRequiredProfileErrorHandler, {
  type Options as UseRequiredProfileErrorHandlerOptions,
} from './use-required-profile-error-handler';

type Options = UseRequiredProfileErrorHandlerOptions & UseMfaVerificationErrorHandlerOptions;

const usePreSignInErrorHandler = ({ replace, linkSocial }: Options = {}): ErrorHandlers => {
  const requiredProfileErrorHandler = useRequiredProfileErrorHandler({ replace, linkSocial });
  const mfaVerificationErrorHandler = useMfaVerificationErrorHandler({ replace });

  return useMemo(
    () => ({ ...requiredProfileErrorHandler, ...mfaVerificationErrorHandler }),
    [mfaVerificationErrorHandler, requiredProfileErrorHandler]
  );
};

export default usePreSignInErrorHandler;
