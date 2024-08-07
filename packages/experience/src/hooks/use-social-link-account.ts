import { useCallback } from 'react';

import { signInAndLinkWithSocial } from '@/apis/experience';
import useApi from '@/hooks/use-api';

import useErrorHandler from './use-error-handler';
import useGlobalRedirectTo from './use-global-redirect-to';
import usePreSignInErrorHandler from './use-pre-sign-in-error-handler';

const useLinkSocial = () => {
  const handleError = useErrorHandler();
  const asyncLinkWithSocial = useApi(signInAndLinkWithSocial);
  const redirectTo = useGlobalRedirectTo();
  const preSignInErrorHandler = usePreSignInErrorHandler({ replace: true });

  return useCallback(
    async (identifierVerificationId: string, socialVerificationId: string) => {
      const [error, result] = await asyncLinkWithSocial(
        identifierVerificationId,
        socialVerificationId
      );

      if (error) {
        await handleError(error, preSignInErrorHandler);

        return;
      }

      if (result?.redirectTo) {
        await redirectTo(result.redirectTo);
      }
    },
    [asyncLinkWithSocial, handleError, preSignInErrorHandler, redirectTo]
  );
};

export default useLinkSocial;
