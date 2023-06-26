import { conditional } from '@silverhand/essentials';
import { HTTPError } from 'ky';
import type { ReactNode } from 'react';
import { Component } from 'react';

import AppError from '@/components/AppError';
import SessionExpired from '@/components/SessionExpired';

type Props = {
  children: ReactNode;
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
    const { children } = this.props;
    const { error } = this.state;

    if (error) {
      if (error instanceof HTTPError) {
        return error.response.status === 401 ? <SessionExpired error={error} /> : children;
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

export default ErrorBoundary;
