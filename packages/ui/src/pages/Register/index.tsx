import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import NavBar from '@/components/NavBar';
import CreateAccount from '@/containers/CreateAccount';
import { PhonePasswordless, EmailPasswordless } from '@/containers/Passwordless';
import ErrorPage from '@/pages/ErrorPage';

import * as styles from './index.module.scss';

type Parameters = {
  method?: string;
};

const Register = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });
  const { method = 'username' } = useParams<Parameters>();

  const registerForm = useMemo(() => {
    if (method === 'sms') {
      return <PhonePasswordless type="register" />;
    }

    if (method === 'email') {
      return <EmailPasswordless type="register" />;
    }

    return <CreateAccount />;
  }, [method]);

  if (!['email', 'sms', 'username'].includes(method)) {
    return <ErrorPage />;
  }

  return (
    <div className={styles.wrapper}>
      <NavBar />
      <div className={styles.container}>
        <div className={styles.title}>{t('action.create_account')}</div>
        {registerForm}
      </div>
    </div>
  );
};

export default Register;
