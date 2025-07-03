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
  const { navigateTenant } = useContext(TenantsContext);
  const redirectUri = useRedirectUri();

  const oneTimeToken = searchParams.get(OneTimeTokenLandingSearchParams.OneTimeToken);
  const email = searchParams.get(OneTimeTokenLandingSearchParams.Email);

  useEffect(() => {
    if (isAuthenticated || !oneTimeToken || !email) {
      // Navigate to root, which will handle tenant selection
      navigate('/', { replace: true });
      return;
    }

    void signIn({
      redirectUri,
      /**
       * Can not clear tokens here since user may already have tokens and let user select which account to keep.
       * We can hence clear tokens in the <Callback /> page.
       */
      clearTokens: false,
      extraParams: {
        [ExtraParamsKey.OneTimeToken]: oneTimeToken,
        [ExtraParamsKey.LoginHint]: email,
      },
    });
  }, [isAuthenticated, navigate, navigateTenant, signIn, redirectUri, oneTimeToken, email]);

  return <AppLoading />;
}

export default OneTimeTokenLanding;
