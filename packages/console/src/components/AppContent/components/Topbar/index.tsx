import React from 'react';
import { useTranslation } from 'react-i18next';

import logo from '@/assets/images/logo.svg';

import * as styles from './index.module.scss';

const Topbar = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.topbar}>
      <img src={logo} />
      <div className={styles.line} />
      <div className={styles.text}>{t('admin_console.title')}</div>
    </div>
  );
};

export default Topbar;
