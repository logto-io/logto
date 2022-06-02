import React from 'react';
import { useTranslation } from 'react-i18next';

import LogtoLogo from '@/assets/logo/Logto_dark.png';
import Card from '@/components/Card';

import RegisterForm from './RegisterForm';
import * as styles from './index.module.scss';

const Register = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={styles.container}>
      <div className={styles.placeholder} />
      <Card className={styles.main}>
        <div className={styles.header}>
          <img className={styles.logo} alt="logto" src={LogtoLogo} />
          <div className={styles.title}>{t('register.description.welcome_title')}</div>
          <div className={styles.subject}>{t('register.description.welcome_description')}</div>
        </div>
        <RegisterForm />
      </Card>
      <div className={styles.placeholder} />
    </div>
  );
};

export default Register;
