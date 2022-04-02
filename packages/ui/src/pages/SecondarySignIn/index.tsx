import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router-dom';

import NavArrowIcon from '@/components/Icons/NavArrowIcon';
import { PhonePasswordless, EmailPasswordless } from '@/containers/Passwordless';
import UsernameSignin from '@/containers/UsernameSignin';

import * as styles from './index.module.scss';

type Props = {
  channel?: 'phone' | 'email' | 'username';
};

const SecondarySignIn = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { channel } = useParams<Props>();

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
            history.goBack();
          }}
        />
      </div>
      <div className={styles.title}>{t('sign_in.sign_in')}</div>
      {signInForm}
    </div>
  );
};

export default SecondarySignIn;
