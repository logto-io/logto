import { Optional } from '@silverhand/essentials';
import { useCallback, useEffect, useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { registerWithSocial, bindSocialRelatedUser } from '@/apis/social';
import useApi from '@/hooks/use-api';
import { PageContext } from '@/hooks/use-page-context';
import { LocalSignInMethod } from '@/types';

type LocationState = {
  relatedUser?: string;
};

const useBindSocial = () => {
  const state = useLocation().state as Optional<LocationState>;
  const { experienceSettings } = useContext(PageContext);
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

  const localSignInMethods = useMemo(() => {
    const primaryMethod = experienceSettings?.primarySignInMethod;
    const secondaryMethods = experienceSettings?.secondarySignInMethods ?? [];

    return [primaryMethod, ...secondaryMethods].filter(
      (method): method is LocalSignInMethod => Boolean(method) && method !== 'social'
    );
  }, [experienceSettings]);

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
    localSignInMethods,
    relatedUser: state?.relatedUser,
    registerWithSocial: createAccountHandler,
    bindSocialRelatedUser: bindRelatedUserHandler,
  };
};

export default useBindSocial;
