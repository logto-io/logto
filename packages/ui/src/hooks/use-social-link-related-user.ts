import { useEffect } from 'react';

import { bindSocialRelatedUser } from '@/apis/interaction';
import useApi from '@/hooks/use-api';

const useBindSocialRelatedUser = () => {
  const { result: bindUserResult, run: asyncBindSocialRelatedUser } = useApi(bindSocialRelatedUser);

  useEffect(() => {
    if (bindUserResult?.redirectTo) {
      window.location.replace(bindUserResult.redirectTo);
    }
  }, [bindUserResult]);

  return asyncBindSocialRelatedUser;
};

export default useBindSocialRelatedUser;
