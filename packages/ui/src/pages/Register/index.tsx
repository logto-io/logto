import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router-dom';

import NavArrowIcon from '@/components/Icons/NavArrowIcon';
import CreateAccount from '@/containers/CreateAccount';
import { PhonePasswordless, EmailPasswordless } from '@/containers/Passwordless';

import * as styles from './index.module.scss';

type Props = {
  channel?: 'phone' | 'email' | 'username';
};

const Register = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { channel } = useParams<Props>();

  const registerForm = useMemo(() => {
    if (channel === 'phone') {
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
            history.goBack();
          }}
        />
      </div>
      <div className={styles.title}>{t('register.create_account')}</div>
      {registerForm}
    </div>
  );
};

export default Register;
