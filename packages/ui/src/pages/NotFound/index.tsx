import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import Button from '@/components/Button';
import { ErrorIcon } from '@/components/Icons';
import NavBar from '@/components/NavBar';

import * as styles from './index.module.scss';

const NotFound = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <NavBar />
      <div className={styles.wrapper}>
        <ErrorIcon className={styles.icon} />
        <div className={styles.message}>404 {t('description.not_found')}</div>
        <div className={styles.placeHolder} />
        <Button
          className={styles.backBtn}
          onClick={() => {
            navigate(-1);
          }}
        >
          {t('action.back')}
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
