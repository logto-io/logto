import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import NavBar from '@/components/NavBar';
import { PhonePasswordless, EmailPasswordless } from '@/containers/Passwordless';
import UsernameSignIn from '@/containers/UsernameSignIn';
import ErrorPage from '@/pages/ErrorPage';

import * as styles from './index.module.scss';

type Props = {
  method?: string;
};

const SecondarySignIn = () => {
  const { t } = useTranslation();
  const { method = 'username' } = useParams<Props>();

  const signInForm = useMemo(() => {
    if (method === 'sms') {
      // eslint-disable-next-line jsx-a11y/no-autofocus
      return <PhonePasswordless autoFocus type="sign-in" />;
    }

    if (method === 'email') {
      // eslint-disable-next-line jsx-a11y/no-autofocus
      return <EmailPasswordless autoFocus type="sign-in" />;
    }

    // eslint-disable-next-line jsx-a11y/no-autofocus
    return <UsernameSignIn autoFocus />;
  }, [method]);

  if (!['email', 'sms', 'username'].includes(method)) {
    return <ErrorPage />;
  }

  return (
    <div className={styles.wrapper}>
      <NavBar />
      <div className={styles.container}>
        <div className={styles.title}>{t('action.sign_in')}</div>
        {signInForm}
      </div>
    </div>
  );
};

export default SecondarySignIn;
