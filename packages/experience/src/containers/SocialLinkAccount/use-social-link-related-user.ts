import { useCallback } from 'react';

import { bindSocialRelatedUser } from '@/apis/experience';
import useApi from '@/hooks/use-api';
import useErrorHandler from '@/hooks/use-error-handler';
import useGlobalRedirectTo from '@/hooks/use-global-redirect-to';
import usePreSignInErrorHandler from '@/hooks/use-pre-sign-in-error-handler';

const useBindSocialRelatedUser = () => {
  const handleError = useErrorHandler();
  const preSignInErrorHandler = usePreSignInErrorHandler();
  const redirectTo = useGlobalRedirectTo();

  const asyncBindSocialRelatedUser = useApi(bindSocialRelatedUser);

  return useCallback(
    async (...payload: Parameters<typeof bindSocialRelatedUser>) => {
      const [error, result] = await asyncBindSocialRelatedUser(...payload);

      if (error) {
        await handleError(error, preSignInErrorHandler);

        return;
      }

      if (result?.redirectTo) {
        await redirectTo(result.redirectTo);
      }
    },
    [asyncBindSocialRelatedUser, handleError, preSignInErrorHandler, redirectTo]
  );
};

export default useBindSocialRelatedUser;
