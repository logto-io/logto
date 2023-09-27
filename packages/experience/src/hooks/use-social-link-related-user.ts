import { useCallback } from 'react';

import { bindSocialRelatedUser } from '@/apis/interaction';

import useApi from './use-api';
import useErrorHandler from './use-error-handler';
import useMfaVerificationErrorHandler from './use-mfa-verification-error-handler';
import useRequiredProfileErrorHandler from './use-required-profile-error-handler';

const useBindSocialRelatedUser = () => {
  const handleError = useErrorHandler();
  const requiredProfileErrorHandlers = useRequiredProfileErrorHandler();
  const mfaVerificationErrorHandler = useMfaVerificationErrorHandler();

  const asyncBindSocialRelatedUser = useApi(bindSocialRelatedUser);

  return useCallback(
    async (...payload: Parameters<typeof bindSocialRelatedUser>) => {
      const [error, result] = await asyncBindSocialRelatedUser(...payload);

      if (error) {
        await handleError(error, {
          ...requiredProfileErrorHandlers,
          ...mfaVerificationErrorHandler,
        });

        return;
      }

      if (result?.redirectTo) {
        window.location.replace(result.redirectTo);
      }
    },
    [
      asyncBindSocialRelatedUser,
      handleError,
      mfaVerificationErrorHandler,
      requiredProfileErrorHandlers,
    ]
  );
};

export default useBindSocialRelatedUser;
