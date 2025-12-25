import { LogtoClientError, LogtoError, LogtoRequestError } from '@logto/react';
import { HTTPError } from 'ky';
import type { ReactNode } from 'react';
import { Component } from 'react';

import ErrorPage from '@ac/components/ErrorPage';
import SessionExpired from '@ac/pages/SessionExpired';

const isOidcInvalidGrantError = (error: Error) => {
  if (!(error instanceof LogtoRequestError)) {
    return false;
  }

  const oidcGrantErrors = ['oidc.invalid_grant', 'oidc.invalid_target'];

  return oidcGrantErrors.includes(error.code);
};

type Props = {
  readonly children: ReactNode;
};

type State = {
  error?: Error;
};

class ErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  public state: State = {};

  render() {
    const { children } = this.props;
    const { error } = this.state;

    if (!error) {
      return children;
    }

    if (
      error instanceof LogtoError ||
      error instanceof LogtoClientError ||
      isOidcInvalidGrantError(error) ||
      (error instanceof HTTPError && error.response.status === 401)
    ) {
      return <SessionExpired />;
    }

    return <ErrorPage titleKey="error.something_went_wrong" rawMessage={error.message} />;
  }
}

export default ErrorBoundary;
