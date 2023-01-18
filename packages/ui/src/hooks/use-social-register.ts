import { useEffect } from 'react';

import { registerWithVerifiedSocial } from '@/apis/interaction';

import useApi from './use-api';
import useRequiredProfileErrorHandler from './use-required-profile-error-handler';

const useSocialRegister = (connectorId?: string) => {
  const requiredProfileErrorHandlers = useRequiredProfileErrorHandler({ linkSocial: connectorId });

  const { result: registerResult, run: asyncRegisterWithSocial } = useApi(
    registerWithVerifiedSocial,
    requiredProfileErrorHandlers
  );

  useEffect(() => {
    if (registerResult?.redirectTo) {
      window.location.replace(registerResult.redirectTo);
    }
  }, [registerResult]);

  return asyncRegisterWithSocial;
};

export default useSocialRegister;
