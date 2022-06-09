import { LogtoError, OidcError, useHandleSignInCallback } from '@logto/react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import AppError from '@/components/AppError';
import LogtoLoading from '@/components/LogtoLoading';

const Callback = () => {
  const navigate = useNavigate();
  const { error } = useHandleSignInCallback(() => {
    navigate('/');
  });

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
