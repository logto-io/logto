import React from 'react';
import { useTranslation } from 'react-i18next';

import errorImage from '@/assets/images/error.svg';
import Card from '@/components/Card';

import * as styles from './index.module.scss';

const NotFound = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <Card className={styles.container}>
      <img src={errorImage} alt="error" />
      <div className={styles.message}>{t('errors.page_not_found')}</div>
    </Card>
  );
};

export default NotFound;
