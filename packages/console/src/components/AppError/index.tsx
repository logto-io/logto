import React, { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ErrorImage from '@/assets/images/warning.svg';
import { ArrowDown, ArrowUp } from '@/icons/Arrow';

import * as styles from './index.module.scss';

type Props = {
  errorMessage?: string;
  callStack?: string;
};

const AppError = ({ errorMessage, callStack }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  return (
    <div className={styles.container}>
      <img src={ErrorImage} alt="oops" />
      <label>{t('errors.something_went_wrong')}</label>
      <div className={styles.summary}>
        <span>{errorMessage}</span>
        {callStack && (
          <>
            <span
              className={styles.expander}
              onClick={() => {
                setIsDetailsOpen(!isDetailsOpen);
              }}
            >
              {t('errors.more_details')}
            </span>
            {isDetailsOpen ? <ArrowUp /> : <ArrowDown />}
          </>
        )}
      </div>
      {callStack && isDetailsOpen && <div className={styles.details}>{callStack}</div>}
    </div>
  );
};

export default AppError;
