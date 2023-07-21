import { useLogto } from '@logto/react';
import { useContext, useEffect } from 'react';

import { getCallbackUrl } from '@/consts';
import { TenantsContext } from '@/contexts/TenantsProvider';
import { saveRedirect } from '@/utils/storage';

import AppLoading from '../AppLoading';

/** This component shows a loading indicator and tries to sign in again. */
function SessionExpired() {
  const { signIn, isLoading } = useLogto();
  const { currentTenantId } = useContext(TenantsContext);

  useEffect(() => {
    if (!isLoading) {
      saveRedirect();
      void signIn(getCallbackUrl(currentTenantId).href);
    }
  }, [signIn, isLoading, currentTenantId]);

  return <AppLoading />;
}

export default SessionExpired;
