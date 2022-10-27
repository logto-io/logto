import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import NavBar from '@/components/NavBar';
import { EmailPasswordless, PhonePasswordless } from '@/containers/Passwordless';
import ErrorPage from '@/pages/ErrorPage';

import * as styles from './index.module.scss';

type Props = {
  method?: string;
};

const ForgotPassword = () => {
  const { t } = useTranslation();
  const { method = '' } = useParams<Props>();

  // TODO: @simeng LOG-4486 apply supported method guard validation. Including the form hasSwitch validation bellow
  if (!['email', 'sms'].includes(method)) {
    return <ErrorPage />;
  }

  const PasswordlessForm = method === 'email' ? EmailPasswordless : PhonePasswordless;

  return (
    <div className={styles.wrapper}>
      <NavBar />
      <div className={styles.container}>
        <div className={styles.title}>{t('description.reset_password')}</div>
        <div className={styles.description}>
          {t(`description.reset_password_description_${method === 'email' ? 'email' : 'sms'}`)}
        </div>
        {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
        <PasswordlessForm autoFocus hasSwitch type="forgot-password" hasTerms={false} />
      </div>
    </div>
  );
};

export default ForgotPassword;
