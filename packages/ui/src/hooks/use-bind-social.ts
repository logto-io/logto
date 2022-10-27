import { conditional } from '@silverhand/essentials';
import { useCallback, useEffect, useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { is } from 'superstruct';

import { registerWithSocial, bindSocialRelatedUser } from '@/apis/social';
import useApi from '@/hooks/use-api';
import { PageContext } from '@/hooks/use-page-context';
import { bindSocialStateGuard } from '@/types/guard';

const useBindSocial = () => {
  const { state } = useLocation();
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
    (connectorId: string) => {
      void asyncBindSocialRelatedUser(connectorId);
    },
    [asyncBindSocialRelatedUser]
  );

  // TODO: @simeng LOG-4487
  const localSignInMethods = useMemo(() => {
    const signInMethods = experienceSettings?.signIn.methods ?? [];

    return signInMethods.map(({ identifier }) => identifier);
  }, [experienceSettings]);

  useEffect(() => {
    if (registerResult?.redirectTo) {
      window.location.replace(registerResult.redirectTo);
    }
  }, [registerResult]);

  useEffect(() => {
    if (bindUserResult?.redirectTo) {
      window.location.replace(bindUserResult.redirectTo);
    }
  }, [bindUserResult]);

  return {
    localSignInMethods,
    relatedUser: conditional(is(state, bindSocialStateGuard) && state.relatedUser),
    registerWithSocial: createAccountHandler,
    bindSocialRelatedUser: bindRelatedUserHandler,
  };
};

export default useBindSocial;
