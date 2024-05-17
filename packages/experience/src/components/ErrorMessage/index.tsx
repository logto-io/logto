import classNames from 'classnames';
import type { TFuncKey } from 'i18next';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import * as styles from './index.module.scss';

type RemovePrefix<T extends string, Prefix extends T> = T extends `${Prefix}${string}` ? never : T;

/**
 * All error codes that can be passed to ErrorMessage.
 * Nested keys are removed since they will result in a non-string return value. They
 * can be processed manually.
 */
type ErrorCode = RemovePrefix<TFuncKey<'translation', 'error'>, 'password_rejected'>;

export type ErrorType = ErrorCode | { code: ErrorCode; data?: Record<string, unknown> };

export type Props = {
  readonly error?: ErrorType;
  readonly className?: string;
  readonly children?: ReactNode;
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

  return (
    <div role="alert" className={classNames(styles.error, className)}>
      {getMessage()}
    </div>
  );
};

export default ErrorMessage;
