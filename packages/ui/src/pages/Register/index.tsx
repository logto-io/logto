import React, { useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import NavArrowIcon from '@/components/Icons/NavArrowIcon';
import CreateAccount from '@/containers/CreateAccount';
import { PhonePasswordless, EmailPasswordless } from '@/containers/Passwordless';

import * as styles from './index.module.scss';

type Parameters = {
  channel?: string;
};

const Register = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });
  const navigate = useNavigate();
  const { channel = 'username' } = useParams<Parameters>();

  useEffect(() => {
    if (channel !== 'email' && channel !== 'sms' && channel !== 'username') {
      navigate('/404', { replace: true });
    }
  }, [channel, navigate]);

  const registerForm = useMemo(() => {
    if (channel === 'sms') {
      return <PhonePasswordless type="register" />;
    }

    if (channel === 'email') {
      return <EmailPasswordless type="register" />;
    }

    return <CreateAccount />;
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
      <div className={styles.title}>{t('action.create_account')}</div>
      {registerForm}
    </div>
  );
};

export default Register;
