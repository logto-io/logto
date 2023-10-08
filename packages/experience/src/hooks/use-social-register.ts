import { useCallback } from 'react';

import { registerWithVerifiedSocial } from '@/apis/interaction';

import useApi from './use-api';
import useErrorHandler from './use-error-handler';
import usePreSignInErrorHandler from './use-pre-sign-in-error-handler';

const useSocialRegister = (connectorId?: string, replace?: boolean) => {
  const handleError = useErrorHandler();
  const asyncRegisterWithSocial = useApi(registerWithVerifiedSocial);

  const preSignInErrorHandler = usePreSignInErrorHandler({ linkSocial: connectorId, replace });

  return useCallback(
    async (connectorId: string) => {
      const [error, result] = await asyncRegisterWithSocial(connectorId);

      if (error) {
        await handleError(error, preSignInErrorHandler);

        return;
      }

      if (result?.redirectTo) {
        window.location.replace(result.redirectTo);
      }
    },
    [asyncRegisterWithSocial, handleError, preSignInErrorHandler]
  );
};

export default useSocialRegister;
