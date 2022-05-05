import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import NavBar from '@/components/NavBar';
import { PhonePasswordless, EmailPasswordless } from '@/containers/Passwordless';
import UsernameSignin from '@/containers/UsernameSignin';
import NotFound from '@/pages/NotFound';

import * as styles from './index.module.scss';

type Props = {
  method?: string;
};

const SecondarySignIn = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });
  const { method = 'username' } = useParams<Props>();

  const signInForm = useMemo(() => {
    if (method === 'sms') {
      return <PhonePasswordless type="sign-in" />;
    }

    if (method === 'email') {
      return <EmailPasswordless type="sign-in" />;
    }

    return <UsernameSignin />;
  }, [method]);

  if (!['email', 'sms', 'username'].includes(method)) {
    return <NotFound />;
  }

  return (
    <>
      <NavBar />
      <div className={styles.wrapper}>
        <div className={styles.title}>{t('action.sign_in')}</div>
        {signInForm}
      </div>
    </>
  );
};

export default SecondarySignIn;
