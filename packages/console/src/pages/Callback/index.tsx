import { LogtoError, OidcError, useHandleSignInCallback } from '@logto/react';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import AppError from '@/components/AppError';
import LogtoLoading from '@/components/LogtoLoading';
import { getBasename } from '@/utilities/app';

const Callback = () => {
  const { error, isAuthenticated } = useHandleSignInCallback(getBasename());
  const navigate = useNavigate();

  /**
   * Redirect back to the home page if the user is already authenticated.
   * Corner case when user mistakenly navigate to `/callback` route after a successful authentication.
   */
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  if (error) {
    const errorCode =
      error instanceof LogtoError && error.data instanceof OidcError
        ? error.data.error
        : error.name;
    const errorMessage =
      error instanceof LogtoError && error.data instanceof OidcError
        ? error.data.errorDescription
        : error.message;

    return <AppError errorCode={errorCode} errorMessage={errorMessage} callStack={error.stack} />;
  }

  return <LogtoLoading message="general.redirecting" />;
};

export default Callback;
