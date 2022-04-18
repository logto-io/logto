import { conditional } from '@silverhand/essentials';
import React, { Component, ReactNode } from 'react';
import { Namespace, TFunction, withTranslation } from 'react-i18next';

import ErrorImage from '@/assets/images/table-error.svg';

import * as styles from './index.module.scss';

type Props = {
  children: ReactNode;
  t: TFunction<Namespace, 'admin_console'>;
};

type State = {
  callStack?: string;
  componentStack?: string;
  errorMessage?: string;
  hasError: boolean;
};

class ErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    const errorMessage = conditional(
      typeof error === 'object' && typeof error.message === 'string' && error.message
    );

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

  render() {
    const { children, t } = this.props;
    const { callStack, errorMessage, hasError } = this.state;

    if (hasError) {
      return (
        <div className={styles.container}>
          <div className={styles.wrapper}>
            <img src={ErrorImage} alt="oops" />
            <h2>{t('errors.something_went_wrong')}</h2>
            <details open>
              <summary>{errorMessage}</summary>
              {callStack}
            </details>
          </div>
        </div>
      );
    }

    return children;
  }
}

export default withTranslation()(ErrorBoundary);
