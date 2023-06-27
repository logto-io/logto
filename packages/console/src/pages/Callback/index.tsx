import { useHandleSignInCallback } from '@logto/react';
import { useNavigate } from 'react-router-dom';

import AppLoading from '@/components/AppLoading';

function Callback() {
  const navigate = useNavigate();
  useHandleSignInCallback(() => {
    navigate('/', { replace: true });
  });

  return <AppLoading />;
}

export default Callback;
