import { useCallback } from 'react';

import { registerWithVerifiedIdentifier } from '@/apis/experience';

import useApi from './use-api';
import useErrorHandler from './use-error-handler';
import useGlobalRedirectTo from './use-global-redirect-to';
import usePreSignInErrorHandler from './use-pre-sign-in-error-handler';

const useSocialRegister = (connectorId: string, replace?: boolean) => {
  const handleError = useErrorHandler();
  const asyncRegisterWithSocial = useApi(registerWithVerifiedIdentifier);
  const redirectTo = useGlobalRedirectTo();

  const preSignInErrorHandler = usePreSignInErrorHandler({ linkSocial: connectorId, replace });

  return useCallback(
    async (verificationId: string) => {
      const [error, result] = await asyncRegisterWithSocial(verificationId);

      if (error) {
        await handleError(error, preSignInErrorHandler);

        return;
      }

      if (result?.redirectTo) {
        await redirectTo(result.redirectTo);
      }
    },
    [asyncRegisterWithSocial, handleError, preSignInErrorHandler, redirectTo]
  );
};

export default useSocialRegister;
