import { LogtoErrorCode, LogtoErrorI18nKey } from '@logto/phrases';
import classNames from 'classnames';
import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import * as styles from './index.module.scss';

export type Props = {
  errorCode?: LogtoErrorCode;
  className?: string;
  children?: ReactNode;
};

const ErrorMessage = ({ errorCode, className, children }: Props) => {
  const { i18n } = useTranslation();

  return (
    <div className={classNames(styles.error, className)}>
      {children ?? (errorCode ? i18n.t<string, LogtoErrorI18nKey>(`errors:${errorCode}`) : ``)}
    </div>
  );
};

export default ErrorMessage;
