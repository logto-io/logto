import { AppInsightsContext } from '@logto/app-insights/react';
import { useLogto } from '@logto/react';
import { trySafe } from '@silverhand/essentials';
import { useContext, useEffect } from 'react';

class NoIdTokenClaimsError extends Error {
  name = 'NoIdTokenClaimsError';
  message = 'Cloud not fetch ID Token claims where user is authenticated.';
}

const useTrackUserId = () => {
  const { isAuthenticated, getIdTokenClaims } = useLogto();
  const { isSetupFinished, appInsights } = useContext(AppInsightsContext);

  useEffect(() => {
    const setUserId = async () => {
      if (!appInsights.instance) {
        return;
      }

      if (!isAuthenticated) {
        appInsights.instance.clearAuthenticatedUserContext();

        return;
      }

      const claims = await trySafe(getIdTokenClaims());

      if (claims) {
        appInsights.instance.setAuthenticatedUserContext(claims.sub, claims.sub, true);
      } else {
        appInsights.instance.trackException({ exception: new NoIdTokenClaimsError() });
      }
    };

    if (isSetupFinished) {
      void setUserId();
    }
  }, [getIdTokenClaims, isSetupFinished, isAuthenticated, appInsights.instance]);
};

export default useTrackUserId;
