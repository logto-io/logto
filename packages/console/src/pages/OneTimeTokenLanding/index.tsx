import { useLogto } from '@logto/react';
import { FirstScreen } from '@logto/schemas';
import { yes } from '@silverhand/essentials';
import { useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import AppLoading from '@/components/AppLoading';
import { TenantsContext } from '@/contexts/TenantsProvider';
import useRedirectUri from '@/hooks/use-redirect-uri';

enum OneTimeTokenLandingSearchParams {
  OneTimeToken = 'one_time_token',
  Email = 'email',
  IsNewUser = 'is_new_user',
}

/** The one-time token landing page for sign-in with one-time tokens. */
function OneTimeTokenLanding() {
  const navigate = useNavigate();
  const { isAuthenticated, signIn, isLoading } = useLogto();
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
    }
  }, [isAuthenticated, navigate, currentTenantId, navigateTenant]);

  useEffect(() => {
    const oneTimeToken = searchParams.get(OneTimeTokenLandingSearchParams.OneTimeToken);
    const email = searchParams.get(OneTimeTokenLandingSearchParams.Email);

    const isNewUser = yes(searchParams.get(OneTimeTokenLandingSearchParams.IsNewUser));

    if (!oneTimeToken || !email) {
      navigate('/', { replace: true });
      return;
    }

    if (isLoading || isAuthenticated) {
      return;
    }

    const handleSignIn = async () => {
      try {
        await signIn({
          redirectUri,
          clearTokens: false,
          firstScreen: isNewUser ? FirstScreen.Register : FirstScreen.SignIn,
          extraParams: {
            one_time_token: oneTimeToken,
            login_hint: email,
          },
        });
      } catch {
        navigate('/', { replace: true });
      }
    };

    void handleSignIn();
  }, [searchParams, signIn, isLoading, isAuthenticated, navigate, redirectUri]);

  return <AppLoading />;
}

export default OneTimeTokenLanding;
