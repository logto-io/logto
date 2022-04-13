import React, { useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { NavArrowIcon } from '@/components/Icons';
import { PhonePasswordless, EmailPasswordless } from '@/containers/Passwordless';
import UsernameSignin from '@/containers/UsernameSignin';

import * as styles from './index.module.scss';

type Props = {
  method?: string;
};

const SecondarySignIn = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });
  const navigate = useNavigate();
  const { method = 'username' } = useParams<Props>();

  useEffect(() => {
    if (method !== 'email' && method !== 'sms' && method !== 'username') {
      navigate('/404', { replace: true });
    }
  }, [method, navigate]);

  const signInForm = useMemo(() => {
    if (method === 'sms') {
      return <PhonePasswordless type="sign-in" />;
    }

    if (method === 'email') {
      return <EmailPasswordless type="sign-in" />;
    }

    return <UsernameSignin />;
  }, [method]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.navBar}>
        <NavArrowIcon
          onClick={() => {
            navigate(-1);
          }}
        />
      </div>
      <div className={styles.title}>{t('action.sign_in')}</div>
      {signInForm}
    </div>
  );
};

export default SecondarySignIn;
