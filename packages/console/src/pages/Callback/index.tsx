import { LogtoError, OidcError, useHandleSignInCallback } from '@logto/react';
import React from 'react';
import { useHref } from 'react-router-dom';

import AppError from '@/components/AppError';
import LogtoLoading from '@/components/LogtoLoading';
// Import { getBasename } from '@/utilities/app';

const Callback = () => {
  const basename = useHref('/');
  const { error } = useHandleSignInCallback(basename.slice(0, -1));

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
