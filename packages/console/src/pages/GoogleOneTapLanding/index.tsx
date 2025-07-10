import { useLogto } from '@logto/react';
import { ExtraParamsKey } from '@logto/schemas';
import { useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import AppLoading from '@/components/AppLoading';
import { TenantsContext } from '@/contexts/TenantsProvider';
import useRedirectUri from '@/hooks/use-redirect-uri';

/** The Google One Tap landing page for sign-in with Google One Tap. */
function GoogleOneTapLanding() {
  const navigate = useNavigate();
  const { isAuthenticated, signIn } = useLogto();
  const [searchParams] = useSearchParams();
  const { navigateTenant } = useContext(TenantsContext);
  const redirectUri = useRedirectUri();

  const googleOneTapCredential = searchParams.get(
    ExtraParamsKey.GoogleOneTapCredential
  );

  useEffect(() => {
    if (isAuthenticated || !googleOneTapCredential) {
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
        [ExtraParamsKey.GoogleOneTapCredential]: googleOneTapCredential,
      },
    });
  }, [
    isAuthenticated,
    navigate,
    navigateTenant,
    signIn,
    redirectUri,
    googleOneTapCredential,
  ]);

  return <AppLoading />;
}

export default GoogleOneTapLanding;
