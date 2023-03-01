import type { UserInfoResponse } from '@logto/react';
import { useLogto } from '@logto/react';
import type { Optional } from '@silverhand/essentials';
import { useCallback, useEffect, useState } from 'react';

const useLogtoUserInfo = (): [Optional<UserInfoResponse>, () => void, boolean] => {
  const { fetchUserInfo, isLoading, isAuthenticated } = useLogto();
  const [user, setUser] = useState<UserInfoResponse>();

  const fetch = useCallback(async () => {
    if (isAuthenticated) {
      const userInfo = await fetchUserInfo();
      setUser(userInfo);
    } else {
      // eslint-disable-next-line unicorn/no-useless-undefined
      setUser(undefined);
    }
  }, [fetchUserInfo, isAuthenticated]);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  return [user, fetch, isLoading];
};

export default useLogtoUserInfo;
