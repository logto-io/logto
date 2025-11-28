import { useLogto } from '@logto/react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { sessionExpiredRoute } from '@ac/constants/routes';

const useAccessToken = () => {
  const { getAccessToken } = useLogto();
  const navigate = useNavigate();

  return useCallback(
    async (...args: Parameters<typeof getAccessToken>): Promise<string> => {
      try {
        const accessToken = await getAccessToken(...args);

        if (!accessToken) {
          throw new Error('Session expired');
        }

        return accessToken;
      } catch (error) {
        void navigate(sessionExpiredRoute, { replace: true });
        throw error;
      }
    },
    [getAccessToken, navigate]
  );
};

export default useAccessToken;
