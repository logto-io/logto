import { Prompt, useLogto } from '@logto/react';
import { ExtraParamsKey } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import AppLoading from '@/components/AppLoading';
import useRedirectUri from '@/hooks/use-redirect-uri';
import { saveRedirect } from '@/utils/storage';

enum OneTimeTokenLandingSearchParams {
  OneTimeToken = 'one_time_token',
  Email = 'email',
  Redirect = 'redirect',
}

/** The one-time token landing page for sign-in with one-time tokens. */
function OneTimeTokenLanding() {
  const navigate = useNavigate();
  const { isLoading, signIn } = useLogto();
  const [searchParams] = useSearchParams();
  const redirectUri = useRedirectUri();

  const oneTimeToken = searchParams.get(OneTimeTokenLandingSearchParams.OneTimeToken);
  const email = searchParams.get(OneTimeTokenLandingSearchParams.Email);
  const redirectPath = searchParams.get(OneTimeTokenLandingSearchParams.Redirect);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!oneTimeToken || !email) {
      // Navigate to root, which will handle tenant selection
      navigate('/', { replace: true });
      return;
    }

    saveRedirect(conditional(redirectPath && new URL(redirectPath)));

    void signIn({
      redirectUri,
      /**
       * Can not clear tokens here since user may already have tokens and let user select which account to keep.
       * We can hence clear tokens in the <Callback /> page.
       */
      clearTokens: false,
      prompt: Prompt.Consent,
      extraParams: {
        [ExtraParamsKey.OneTimeToken]: oneTimeToken,
        [ExtraParamsKey.LoginHint]: email,
      },
    });
  }, [isLoading, navigate, signIn, redirectUri, oneTimeToken, email, redirectPath]);

  return <AppLoading />;
}

export default OneTimeTokenLanding;
