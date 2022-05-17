import { useLogto } from '@logto/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHref } from 'react-router-dom';

import WarningIcon from '@/assets/images/warning.svg';

import Button from '../Button';
import * as styles from './index.module.scss';

const SessionExpired = () => {
  const { signIn } = useLogto();
  const href = useHref('/callback');
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={styles.container}>
      <img src={WarningIcon} />
      <div className={styles.title}>{t('session_expire.title')}</div>
      <div className={styles.subtitle}>{t('session_expire.subtitle')}</div>
      <Button
        size="large"
        type="outline"
        title="admin_console.session_expire.button"
        onClick={() => {
          void signIn(new URL(href, window.location.origin).toString());
        }}
      />
    </div>
  );
};

export default SessionExpired;
