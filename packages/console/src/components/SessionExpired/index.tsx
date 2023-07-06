import { useLogto } from '@logto/react';
import { useEffect } from 'react';

import { getCallbackUrl, getUserTenantId } from '@/consts';

import AppLoading from '../AppLoading';

/** This component shows a loading indicator and tries to sign in again. */
function SessionExpired() {
  const { signIn } = useLogto();

  useEffect(() => {
    void signIn(getCallbackUrl(getUserTenantId()).href);
  }, [signIn]);

  return <AppLoading />;
}

export default SessionExpired;
