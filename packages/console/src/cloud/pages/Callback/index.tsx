import { useHandleSignInCallback } from '@logto/react';
import { useNavigate } from 'react-router-dom';

import AppLoading from '@/components/AppLoading';
import { getUserTenantId } from '@/consts/tenants';

function Callback() {
  const navigate = useNavigate();
  const { error } = useHandleSignInCallback(() => {
    navigate('/' + getUserTenantId(), { replace: true });
  });

  if (error) {
    return (
      <div>
        Error Occurred:
        <br />
        {error.message}
      </div>
    );
  }

  return <AppLoading />;
}

export default Callback;
