import { useHandleSignInCallback } from '@logto/react';
import { useNavigate } from 'react-router-dom';

import AppLoading from '@/components/AppLoading';
import { getUserTenantId } from '@/consts/tenants';

function Callback() {
  const navigate = useNavigate();
  useHandleSignInCallback(() => {
    navigate('/' + getUserTenantId(), { replace: true });
  });

  return <AppLoading />;
}

export default Callback;
