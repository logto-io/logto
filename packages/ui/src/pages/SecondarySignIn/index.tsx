import React, { useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import NavArrowIcon from '@/components/Icons/NavArrowIcon';
import { PhonePasswordless, EmailPasswordless } from '@/containers/Passwordless';
import UsernameSignin from '@/containers/UsernameSignin';

import * as styles from './index.module.scss';

type Props = {
  channel?: string;
};

const SecondarySignIn = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });
  const navigate = useNavigate();
  const { channel = 'username' } = useParams<Props>();

  useEffect(() => {
    if (channel !== 'email' && channel !== 'phone' && channel !== 'username') {
      navigate('/404', { replace: true });
    }
  }, [channel, navigate]);

  const signInForm = useMemo(() => {
    if (channel === 'phone') {
      return <PhonePasswordless type="sign-in" />;
    }

    if (channel === 'email') {
      return <EmailPasswordless type="sign-in" />;
    }

    return <UsernameSignin />;
  }, [channel]);

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
