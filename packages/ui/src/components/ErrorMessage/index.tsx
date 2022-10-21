import classNames from 'classnames';
import type { ReactNode } from 'react';
import type { TFuncKey } from 'react-i18next';
import { useTranslation } from 'react-i18next';

import * as styles from './index.module.scss';

type ErrorCode = TFuncKey<'translation', 'error'>;

export type ErrorType = ErrorCode | { code: ErrorCode; data?: Record<string, unknown> };

export type Props = {
  error?: ErrorType;
  className?: string;
  children?: ReactNode;
};

const ErrorMessage = ({ error, className, children }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'error' });

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
