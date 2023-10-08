import { useCallback } from 'react';

import { bindSocialRelatedUser } from '@/apis/interaction';

import useApi from './use-api';
import useErrorHandler from './use-error-handler';
import usePreSignInErrorHandler from './use-pre-sign-in-error-handler';

const useBindSocialRelatedUser = () => {
  const handleError = useErrorHandler();
  const preSignInErrorHandler = usePreSignInErrorHandler();

  const asyncBindSocialRelatedUser = useApi(bindSocialRelatedUser);

  return useCallback(
    async (...payload: Parameters<typeof bindSocialRelatedUser>) => {
      const [error, result] = await asyncBindSocialRelatedUser(...payload);

      if (error) {
        await handleError(error, preSignInErrorHandler);

        return;
      }

      if (result?.redirectTo) {
        window.location.replace(result.redirectTo);
      }
    },
    [asyncBindSocialRelatedUser, handleError, preSignInErrorHandler]
  );
};

export default useBindSocialRelatedUser;
