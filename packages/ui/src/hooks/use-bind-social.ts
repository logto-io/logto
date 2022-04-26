import { Optional } from '@silverhand/essentials';
import { useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { registerWithSocial, bindSocialRelatedUser } from '@/apis/social';
import useApi from '@/hooks/use-api';

type LocationState = {
  relatedUser?: string;
};

const useBindSocial = () => {
  const state = useLocation().state as Optional<LocationState>;
  const { result: registerResult, run: asyncRegisterWithSocial } = useApi(registerWithSocial);
  const { result: bindUserResult, run: asyncBindSocialRelatedUser } = useApi(bindSocialRelatedUser);

  const createAccountHandler = useCallback(
    (connectorId: string) => {
      void asyncRegisterWithSocial(connectorId);
    },
    [asyncRegisterWithSocial]
  );

  const bindRelatedUserHandler = useCallback(
    (connectorId) => {
      void asyncBindSocialRelatedUser(connectorId);
    },
    [asyncBindSocialRelatedUser]
  );

  useEffect(() => {
    if (registerResult?.redirectTo) {
      window.location.assign(registerResult.redirectTo);
    }
  }, [registerResult]);

  useEffect(() => {
    if (bindUserResult?.redirectTo) {
      window.location.assign(bindUserResult.redirectTo);
    }
  }, [bindUserResult]);

  return {
    relatedUser: state?.relatedUser,
    registerWithSocial: createAccountHandler,
    bindSocialRelatedUser: bindRelatedUserHandler,
  };
};

export default useBindSocial;
