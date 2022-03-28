import { LogtoErrorCode, LogtoErrorI18nKey } from '@logto/phrases';
import classNames from 'classnames';
import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import * as styles from './index.module.scss';

export type ErrorType = LogtoErrorCode | { code: LogtoErrorCode; data?: Record<string, unknown> };

export type Props = {
  error?: ErrorType;
  className?: string;
  children?: ReactNode;
};

const ErrorMessage = ({ error, className, children }: Props) => {
  const { i18n } = useTranslation();

  const getMessage = () => {
    if (!error) {
      return children;
    }

    if (typeof error === 'string') {
      return i18n.t<string, LogtoErrorI18nKey>(`errors:${error}`);
    }

    return i18n.t<string, LogtoErrorI18nKey>(`errors:${error.code}`, { ...error.data });
  };

  return <div className={classNames(styles.error, className)}>{getMessage()}</div>;
};

export default ErrorMessage;
