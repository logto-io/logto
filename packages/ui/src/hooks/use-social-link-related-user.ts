import { useEffect } from 'react';

import { bindSocialRelatedUser } from '@/apis/interaction';
import useApi from '@/hooks/use-api';

import useRequiredProfileErrorHandler from './use-required-profile-error-handler';

const useBindSocialRelatedUser = () => {
  const requiredProfileErrorHandlers = useRequiredProfileErrorHandler();
  const { result: bindUserResult, run: asyncBindSocialRelatedUser } = useApi(
    bindSocialRelatedUser,
    requiredProfileErrorHandlers
  );

  useEffect(() => {
    if (bindUserResult?.redirectTo) {
      window.location.replace(bindUserResult.redirectTo);
    }
  }, [bindUserResult]);

  return asyncBindSocialRelatedUser;
};

export default useBindSocialRelatedUser;
