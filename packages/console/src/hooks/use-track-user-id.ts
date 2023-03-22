import { useLogto } from '@logto/react';
import { trySafe } from '@silverhand/essentials';
import { useEffect } from 'react';

import { getAppInsights } from '@/utils/app-insights';

class NoIdTokenClaimsError extends Error {
  name = 'NoIdTokenClaimsError';
  message = 'Cloud not fetch ID Token claims where user is authenticated.';
}

const useTrackUserId = () => {
  const { isAuthenticated, getIdTokenClaims } = useLogto();

  useEffect(() => {
    const setUserId = async () => {
      const appInsights = getAppInsights();

      if (!appInsights) {
        return;
      }

      if (!isAuthenticated) {
        appInsights.clearAuthenticatedUserContext();

        return;
      }

      const claims = await trySafe(getIdTokenClaims());

      if (claims) {
        appInsights.setAuthenticatedUserContext(claims.sub, claims.sub, true);
      } else {
        appInsights.trackException({ exception: new NoIdTokenClaimsError() });
      }
    };

    void setUserId();
  }, [getIdTokenClaims, isAuthenticated]);
};

export default useTrackUserId;
