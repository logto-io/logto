import { conditional } from '@silverhand/essentials';
import { useMemo } from 'react';

import { isDevelopmentFeaturesEnabled } from '@/constants/env';

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
    () => ({
      ...requiredProfileErrorHandler,
      ...conditional(isDevelopmentFeaturesEnabled && mfaVerificationErrorHandler),
    }),
    [mfaVerificationErrorHandler, requiredProfileErrorHandler]
  );
};

export default usePreSignInErrorHandler;
