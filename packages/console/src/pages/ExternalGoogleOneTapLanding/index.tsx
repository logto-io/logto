import { GoogleConnector, logtoGoogleOneTapCookieKey } from '@logto/connector-kit';
import { useLogto } from '@logto/react';
import { ExtraParamsKey } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCookie } from 'tiny-cookie';

import AppLoading from '@/components/AppLoading';
import { TenantsContext } from '@/contexts/TenantsProvider';
import useRedirectUri from '@/hooks/use-redirect-uri';

/** The external Google One Tap landing page for external website integration. */
function ExternalGoogleOneTapLanding() {
  const navigate = useNavigate();
  const { isAuthenticated, signIn } = useLogto();
  const { navigateTenant } = useContext(TenantsContext);
  const redirectUri = useRedirectUri();
  const [logtoGoogleOneTapCookie, setLogtoGoogleOneTapCookie] = useState<string>();

  useEffect(() => {
    const cookieValue = getCookie(logtoGoogleOneTapCookieKey);
    if (cookieValue) {
      setLogtoGoogleOneTapCookie(cookieValue);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
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
      directSignIn: {
        method: 'social',
        target: GoogleConnector.target,
      },
      ...conditional(
        logtoGoogleOneTapCookie && {
          extraParams: {
            [ExtraParamsKey.GoogleOneTapCredential]: logtoGoogleOneTapCookie,
          },
        }
      ),
    });
  }, [isAuthenticated, navigate, navigateTenant, signIn, redirectUri, logtoGoogleOneTapCookie]);

  return <AppLoading />;
}

export default ExternalGoogleOneTapLanding;
