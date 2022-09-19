import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import NavBar from '@/components/NavBar';
import { PhonePasswordless, EmailPasswordless } from '@/containers/Passwordless';
import TermsOfUse from '@/containers/TermsOfUse';
import UsernameSignIn from '@/containers/UsernameSignIn';
import useTerms from '@/hooks/use-terms';
import ErrorPage from '@/pages/ErrorPage';

import * as styles from './index.module.scss';

type Props = {
  method?: string;
};

const SecondarySignIn = () => {
  const { t } = useTranslation();
  const { method = 'username' } = useParams<Props>();

  const { termsValidation } = useTerms();

  const signInForm = useMemo(() => {
    if (method === 'sms') {
      return (
        <PhonePasswordless autoFocus type="sign-in" onSubmitValidation={termsValidation}>
          <TermsOfUse />
        </PhonePasswordless>
      );
    }

    if (method === 'email') {
      return (
        <EmailPasswordless autoFocus type="sign-in" onSubmitValidation={termsValidation}>
          <TermsOfUse />
        </EmailPasswordless>
      );
    }

    return <UsernameSignIn autoFocus />;
  }, [method, termsValidation]);

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
