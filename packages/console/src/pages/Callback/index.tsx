import { LogtoError, OidcError, useHandleSignInCallback } from '@logto/react';
import React from 'react';

import AppError from '@/components/AppError';
import LogtoLoading from '@/components/LogtoLoading';
import { getBasename } from '@/utilities/app';

const Callback = () => {
  const { error } = useHandleSignInCallback(getBasename());

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
