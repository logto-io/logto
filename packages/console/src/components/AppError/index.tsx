import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import ErrorImage from '@/assets/images/warning.svg';
import { KeyboardArrowDown, KeyboardArrowUp } from '@/icons/Arrow';

import * as styles from './index.module.scss';

type Props = {
  title?: string;
  errorCode?: string;
  errorMessage?: string;
  callStack?: string;
  children?: React.ReactNode;
};

const AppError = ({ title, errorCode, errorMessage, callStack, children }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  return (
    <div className={styles.container}>
      <img src={ErrorImage} alt="oops" />
      <label>{title ?? t('errors.something_went_wrong')}</label>
      <div className={styles.summary}>
        <span>
          {errorCode}
          {errorCode && errorMessage && ': '}
          {errorMessage}
          {callStack && (
            <span
              className={styles.expander}
              onClick={() => {
                setIsDetailsOpen(!isDetailsOpen);
              }}
            >
              {t('errors.more_details')}
              {isDetailsOpen ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </span>
          )}
        </span>
      </div>
      {callStack && isDetailsOpen && <div className={styles.details}>{callStack}</div>}
      {children}
    </div>
  );
};

export default AppError;
