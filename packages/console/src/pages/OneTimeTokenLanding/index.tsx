import { useLogto } from '@logto/react';
import { ExtraParamsKey } from '@logto/schemas';
import { useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import AppLoading from '@/components/AppLoading';
import { TenantsContext } from '@/contexts/TenantsProvider';
import useRedirectUri from '@/hooks/use-redirect-uri';

enum OneTimeTokenLandingSearchParams {
  OneTimeToken = 'one_time_token',
  Email = 'email',
}

/** The one-time token landing page for sign-in with one-time tokens. */
function OneTimeTokenLanding() {
  const navigate = useNavigate();
  const { isAuthenticated, signIn } = useLogto();
  const [searchParams] = useSearchParams();
  const { navigateTenant, currentTenantId } = useContext(TenantsContext);
  const redirectUri = useRedirectUri();

  useEffect(() => {
    if (isAuthenticated) {
      // If we have a current tenant, navigate to it
      if (currentTenantId) {
        navigateTenant(currentTenantId);
      } else {
        // Otherwise navigate to root, which will handle tenant selection
        navigate('/', { replace: true });
      }
      return;
    }

    const oneTimeToken = searchParams.get(OneTimeTokenLandingSearchParams.OneTimeToken);
    const email = searchParams.get(OneTimeTokenLandingSearchParams.Email);

    if (!oneTimeToken || !email) {
      navigate('/', { replace: true });
      return;
    }

    void signIn({
      redirectUri,
      clearTokens: false,
      extraParams: {
        [ExtraParamsKey.OneTimeToken]: oneTimeToken,
        [ExtraParamsKey.LoginHint]: email,
      },
    });
  }, [isAuthenticated, navigate, currentTenantId, navigateTenant, searchParams, signIn, redirectUri]);

  return <AppLoading />;
}

export default OneTimeTokenLanding;
