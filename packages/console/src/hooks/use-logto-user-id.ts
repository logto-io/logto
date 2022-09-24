import { useLogto } from '@logto/react';
import { useEffect, useState } from 'react';

const useLogtoUserId = () => {
  const { getIdTokenClaims, isAuthenticated } = useLogto();
  const [userId, setUserId] = useState<string>();

  useEffect(() => {
    const fetch = async () => {
      const claims = await getIdTokenClaims();
      setUserId(claims?.sub);
    };

    if (isAuthenticated) {
      void fetch();
    } else {
      // eslint-disable-next-line unicorn/no-useless-undefined
      setUserId(undefined);
    }
  }, [getIdTokenClaims, isAuthenticated]);

  return userId;
};

export default useLogtoUserId;
