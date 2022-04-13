import React, { useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import NavArrowIcon from '@/components/Icons/NavArrowIcon';
import CreateAccount from '@/containers/CreateAccount';
import { PhonePasswordless, EmailPasswordless } from '@/containers/Passwordless';

import * as styles from './index.module.scss';

type Parameters = {
  method?: string;
};

const Register = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });
  const navigate = useNavigate();
  const { method = 'username' } = useParams<Parameters>();

  useEffect(() => {
    if (!['email', 'sms', 'username'].includes(method)) {
      navigate('/404', { replace: true });
    }
  }, [method, navigate]);

  const registerForm = useMemo(() => {
    if (method === 'sms') {
      return <PhonePasswordless type="register" />;
    }

    if (method === 'email') {
      return <EmailPasswordless type="register" />;
    }

    return <CreateAccount />;
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
      <div className={styles.title}>{t('action.create_account')}</div>
      {registerForm}
    </div>
  );
};

export default Register;
