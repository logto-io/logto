import { conditional } from '@silverhand/essentials';
import type { ReactNode } from 'react';
import { Component } from 'react';

import AppError from '../../components/AppError';

type Props = {
  children: ReactNode;
};

type State = {
  callStack?: string;
  componentStack?: string;
  errorMessage?: string;
  hasError: boolean;
};

class ErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: Error): State {
    const errorMessage = String(error);

    const callStack = conditional(
      typeof error === 'object' &&
        typeof error.stack === 'string' &&
        error.stack.split('\n').slice(1).join('\n')
    );

    return { callStack, errorMessage, hasError: true };
  }

  public state: State = {
    callStack: undefined,
    errorMessage: undefined,
    hasError: false,
  };

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
    const { callStack, errorMessage, hasError } = this.state;

    if (hasError) {
      return <AppError errorMessage={errorMessage} callStack={callStack} />;
    }

    return children;
  }
}

export default ErrorBoundary;
