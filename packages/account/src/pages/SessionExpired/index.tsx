import { useLogto } from '@logto/react';
import { useCallback, useEffect, useState } from 'react';

import ErrorPage from '@ac/components/ErrorPage';
import GlobalLoading from '@ac/components/GlobalLoading';
import { accountCenterBasePath, setRouteRestore } from '@ac/utils/account-center-route';

const redirectUri = `${window.location.origin}${accountCenterBasePath}`;

const SessionExpired = () => {
  const { signIn } = useLogto();
  const [hasSignInError, setHasSignInError] = useState(false);

  const redirectToSignIn = useCallback(() => {
    setHasSignInError(false);
    setRouteRestore(window.location.pathname);

    const run = async () => {
      try {
        await signIn({ redirectUri });
      } catch {
        setHasSignInError(true);
      }
    };

    void run();
  }, [signIn]);

  useEffect(() => {
    redirectToSignIn();
  }, [redirectToSignIn]);

  if (!hasSignInError) {
    return <GlobalLoading />;
  }

  return (
    <ErrorPage
      titleKey="error.something_went_wrong"
      messageKey="error.invalid_session"
      action={{
        titleKey: 'action.sign_in',
        onClick: redirectToSignIn,
      }}
    />
  );
};

export default SessionExpired;
