import { useLogto } from '@logto/react';
import { useEffect } from 'react';

import { getCallbackUrl, getUserTenantId } from '@/consts';
import { saveRedirect } from '@/utils/storage';

import AppLoading from '../AppLoading';

/** This component shows a loading indicator and tries to sign in again. */
function SessionExpired() {
  const { signIn, isLoading } = useLogto();

  useEffect(() => {
    if (!isLoading) {
      saveRedirect();
      void signIn(getCallbackUrl(getUserTenantId()).href);
    }
  }, [signIn, isLoading]);

  return <AppLoading />;
}

export default SessionExpired;
