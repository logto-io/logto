import { useLogto } from '@logto/react';
import { useEffect } from 'react';

import useRedirectUri from '@/hooks/use-redirect-uri';
import { saveRedirect } from '@/utils/storage';

import AppLoading from '../AppLoading';

/** This component shows a loading indicator and tries to sign in again. */
function SessionExpired() {
  const { signIn, isLoading } = useLogto();
  const redirectUri = useRedirectUri();

  useEffect(() => {
    if (!isLoading) {
      saveRedirect();
      void signIn(redirectUri.href);
    }
  }, [signIn, isLoading, redirectUri]);

  return <AppLoading />;
}

export default SessionExpired;
