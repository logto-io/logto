import { useHandleSignInCallback, useLogto } from '@logto/react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import AppLoading from '@/components/AppLoading';
import { consumeSavedRedirect } from '@/utils/storage';

/** The global callback page for all sign-in redirects from Logto main flow. */
function Callback() {
  const navigate = useNavigate();
  const { clearAllTokens } = useLogto();

  useEffect(() => {
    void clearAllTokens();
  }, [clearAllTokens]);

  useHandleSignInCallback(() => {
    const saved = consumeSavedRedirect();

    if (saved) {
      // Saved redirect is full pathname, no need to use `getTo`.
      navigate(saved, { replace: true });
      return;
    }

    navigate('/', { replace: true });
  });

  return <AppLoading />;
}

export default Callback;
