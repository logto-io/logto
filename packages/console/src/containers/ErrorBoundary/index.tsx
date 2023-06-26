import { LogtoClientError, LogtoError, OidcError } from '@logto/react';
import { conditional } from '@silverhand/essentials';
import { ResponseError } from '@withtyped/client';
import { type TFunction } from 'i18next';
import { HTTPError } from 'ky';
import type { ReactNode } from 'react';
import { Component } from 'react';
import { withTranslation } from 'react-i18next';

import AppError from '@/components/AppError';
import SessionExpired from '@/components/SessionExpired';

type Props = {
  children: ReactNode;
  t: TFunction<'translation', 'admin_console'>;
};

type State = {
  error?: Error;
};

/**
 * An error boundary that catches errors in its children.
 * Note it uses several hooks and contexts:
 *
 * - Includes `useLogto()` (depending on `<LogtoProvider />`) to provide a "Sign in again" button for session expired errors.
 * - Includes `useTranslation()` to provide translations for the error messages.
 * - includes `useTheme()` (depending on `<AppThemeProvider />`) to provide the local stored theme.
 */
class ErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  public state: State = {};

  promiseRejectionHandler(error: unknown) {
    this.setState(
      ErrorBoundary.getDerivedStateFromError(
        error instanceof Error ? error : new Error(String(error))
      )
    );
  }

  componentDidMount(): void {
    window.addEventListener('unhandledrejection', (event) => {
      this.promiseRejectionHandler(event.reason);
    });
  }

  componentWillUnmount(): void {
    window.removeEventListener('unhandledrejection', this.promiseRejectionHandler);
  }

  render() {
    const { children, t } = this.props;
    const { error } = this.state;

    if (error) {
      // Different strategies for handling errors in callback pages
      const { pathname } = window.location;
      if (['/callback', '-callback'].some((path) => pathname.endsWith(path))) {
        if (error instanceof LogtoError && error.data instanceof OidcError) {
          return (
            <AppError
              errorCode={error.data.error}
              errorMessage={error.data.errorDescription}
              callStack={error.stack}
            />
          );
        }

        return (
          <AppError errorCode={error.name} errorMessage={error.message} callStack={error.stack} />
        );
      }

      // Insecure contexts error is not recoverable
      if (error instanceof LogtoError && error.code === 'crypto_subtle_unavailable') {
        return <AppError errorMessage={t('errors.insecure_contexts')} callStack={error.stack} />;
      }

      // Treat other Logto errors and 401 responses as session expired
      if (
        error instanceof LogtoError ||
        error instanceof LogtoClientError ||
        (error instanceof HTTPError && error.response.status === 401) ||
        (error instanceof ResponseError && error.status === 401)
      ) {
        return <SessionExpired error={error} />;
      }

      const callStack = conditional(
        typeof error === 'object' &&
          typeof error.stack === 'string' &&
          error.stack.split('\n').slice(1).join('\n')
      );

      return <AppError errorMessage={error.message} callStack={callStack} />;
    }

    return children;
  }
}

export default withTranslation('translation', { keyPrefix: 'admin_console' })(ErrorBoundary);
