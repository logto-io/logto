import { useAppInsights } from '@logto/app-insights/react';
import { useLogto } from '@logto/react';
import { trySafe } from '@silverhand/essentials';
import { useEffect } from 'react';

class NoIdTokenClaimsError extends Error {
  name = 'NoIdTokenClaimsError';
  message = 'Cloud not fetch ID Token claims where user is authenticated.';
}

const useTrackUserId = () => {
  const { isAuthenticated, getIdTokenClaims } = useLogto();
  const {
    initialized,
    appInsights: { instance },
  } = useAppInsights();

  useEffect(() => {
    const setUserId = async () => {
      if (!instance) {
        return;
      }

      if (!isAuthenticated) {
        instance.clearAuthenticatedUserContext();

        return;
      }

      const claims = await trySafe(getIdTokenClaims());

      if (claims) {
        instance.setAuthenticatedUserContext(claims.sub, claims.sub, true);
      } else {
        instance.trackException({ exception: new NoIdTokenClaimsError() });
      }
    };

    if (initialized) {
      void setUserId();
    }
  }, [getIdTokenClaims, initialized, instance, isAuthenticated]);
};

export default useTrackUserId;
