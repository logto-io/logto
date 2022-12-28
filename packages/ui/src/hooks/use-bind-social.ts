import type { SocialIdentityPayload } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { is } from 'superstruct';

import { registerWithVerifiedSocial, bindSocialRelatedUser } from '@/apis/interaction';
import useApi from '@/hooks/use-api';
import { bindSocialStateGuard } from '@/types/guard';

import useRequiredProfileErrorHandler from './use-required-profile-error-handler';

const useBindSocial = () => {
  const { state } = useLocation();
  const requiredProfileErrorHandlers = useRequiredProfileErrorHandler();

  const { result: registerResult, run: asyncRegisterWithSocial } = useApi(
    registerWithVerifiedSocial,
    requiredProfileErrorHandlers
  );
  const { result: bindUserResult, run: asyncBindSocialRelatedUser } = useApi(
    bindSocialRelatedUser,
    requiredProfileErrorHandlers
  );

  const createAccountHandler = useCallback(
    (connectorId: string) => {
      void asyncRegisterWithSocial(connectorId);
    },
    [asyncRegisterWithSocial]
  );

  const bindRelatedUserHandler = useCallback(
    (payload: SocialIdentityPayload) => {
      void asyncBindSocialRelatedUser(payload);
    },
    [asyncBindSocialRelatedUser]
  );

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
    relatedUser: conditional(is(state, bindSocialStateGuard) && state.relatedUser),
    registerWithSocial: createAccountHandler,
    bindSocialRelatedUser: bindRelatedUserHandler,
  };
};

export default useBindSocial;
