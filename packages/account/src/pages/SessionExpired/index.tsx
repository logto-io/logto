import { useLogto } from '@logto/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import ErrorPage from '@ac/components/ErrorPage';
import GlobalLoading from '@ac/components/GlobalLoading';
import { accountCenterBasePath, setRouteRestore } from '@ac/utils/account-center-route';

const redirectUri = `${window.location.origin}${accountCenterBasePath}`;

const SessionExpired = () => {
  const { signIn, error } = useLogto();
  const initialSignInErrorRef = useRef(error);
  const [hasSignInError, setHasSignInError] = useState(false);
  const [hasTriedSignIn, setHasTriedSignIn] = useState(false);

  const redirectToSignIn = useCallback(() => {
    setHasSignInError(false);
    setHasTriedSignIn(true);
    setRouteRestore(window.location.pathname);

    void signIn({ redirectUri });
  }, [signIn]);

  useEffect(() => {
    redirectToSignIn();
  }, [redirectToSignIn]);

  useEffect(() => {
    if (hasTriedSignIn && error && error !== initialSignInErrorRef.current) {
      setHasSignInError(true);
    }
  }, [error, hasTriedSignIn]);

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
