import classNames from 'classnames';
import React, { ReactNode } from 'react';
import { TFuncKey, useTranslation } from 'react-i18next';

import * as styles from './index.module.scss';

type ErrorCode = TFuncKey<'translation', 'main_flow.error'>;

export type ErrorType = ErrorCode | { code: ErrorCode; data?: Record<string, unknown> };

export type Props = {
  error?: ErrorType;
  className?: string;
  children?: ReactNode;
};

const ErrorMessage = ({ error, className, children }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow.error' });

  const getMessage = () => {
    if (!error) {
      return children;
    }

    if (typeof error === 'string') {
      return t(error);
    }

    return t(error.code, { ...error.data });
  };

  return <div className={classNames(styles.error, className)}>{getMessage()}</div>;
};

export default ErrorMessage;
