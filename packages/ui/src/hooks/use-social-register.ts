import { useCallback } from 'react';

import { registerWithVerifiedSocial } from '@/apis/interaction';

import useApi from './use-api';
import useErrorHandler from './use-error-handler';
import useRequiredProfileErrorHandler from './use-required-profile-error-handler';

const useSocialRegister = (connectorId?: string, replace?: boolean) => {
  const handleError = useErrorHandler();
  const asyncRegisterWithSocial = useApi(registerWithVerifiedSocial);

  const requiredProfileErrorHandlers = useRequiredProfileErrorHandler({
    linkSocial: connectorId,
    replace,
  });

  return useCallback(
    async (connectorId: string) => {
      const [error, result] = await asyncRegisterWithSocial(connectorId);

      if (error) {
        await handleError(error, requiredProfileErrorHandlers);

        return;
      }

      if (result?.redirectTo) {
        window.location.replace(result.redirectTo);
      }
    },
    [asyncRegisterWithSocial, handleError, requiredProfileErrorHandlers]
  );
};

export default useSocialRegister;
