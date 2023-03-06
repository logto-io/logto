import { conditional } from '@silverhand/essentials';
import { HTTPError } from 'ky';
import type { ReactNode } from 'react';
import { Component } from 'react';

import SessionExpired from '@/components/SessionExpired';

import AppError from '../../components/AppError';

type Props = {
  children: ReactNode;
};

type State = {
  error?: Error;
};

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
      if (error instanceof HTTPError && error.response.status === 401) {
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

export default ErrorBoundary;
