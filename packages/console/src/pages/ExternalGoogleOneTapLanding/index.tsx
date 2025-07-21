import { useLogto } from '@logto/react';
import { ExtraParamsKey, FirstScreen } from '@logto/schemas';
import { useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import AppLoading from '@/components/AppLoading';
import { TenantsContext } from '@/contexts/TenantsProvider';
import useRedirectUri from '@/hooks/use-redirect-uri';

enum ExternalGoogleOneTapLandingSearchParams {
  Credential = 'credential',
}

/** The external Google One Tap landing page for external website integration. */
function ExternalGoogleOneTapLanding() {
  const navigate = useNavigate();
  const { isAuthenticated, signIn } = useLogto();
  const [searchParams] = useSearchParams();
  const { navigateTenant } = useContext(TenantsContext);
  const redirectUri = useRedirectUri();

  const credential = searchParams.get(ExternalGoogleOneTapLandingSearchParams.Credential);

  useEffect(() => {
    if (isAuthenticated || !credential) {
      // Navigate to root, which will handle tenant selection
      navigate('/', { replace: true });
      return;
    }

    // Use OIDC extraParams to transport the credential to Experience package
    void signIn({
      redirectUri,
      /**
       * Cannot clear tokens here since the user may already have tokens and let the user select which account to keep.
       * We can hence clear tokens in the <Callback /> page.
       */
      clearTokens: false,
      firstScreen: FirstScreen.SignIn,
      extraParams: {
        [ExtraParamsKey.GoogleOneTapCredential]: credential,
      },
    });
  }, [isAuthenticated, navigate, navigateTenant, signIn, redirectUri, credential]);

  return <AppLoading />;
}

export default ExternalGoogleOneTapLanding;
