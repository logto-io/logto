import { useHandleSignInCallback } from '@logto/react';
import { conditionalString } from '@silverhand/essentials';
import { useNavigate } from 'react-router-dom';

import AppLoading from '@/components/AppLoading';
import { isCloud } from '@/consts/env';
import { getUserTenantId } from '@/consts/tenants';

function Callback() {
  const navigate = useNavigate();
  useHandleSignInCallback(() => {
    navigate('/' + conditionalString(isCloud && getUserTenantId()), { replace: true });
  });

  return <AppLoading />;
}

export default Callback;
