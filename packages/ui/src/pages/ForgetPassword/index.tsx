import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import NavBar from '@/components/NavBar';
import ErrorPage from '@/pages/ErrorPage';

import * as styles from './index.module.scss';

type Props = {
  method?: string;
};

const ForgetPassword = () => {
  const { t } = useTranslation();

  const { method = '' } = useParams<Props>();

  const forgetPasswordForm = useMemo(() => {
    if (method === 'sms') {
      return <div>Phone Number form</div>;
    }

    if (method === 'email') {
      return <div>Email Form</div>;
    }
  }, [method]);

  if (!['email', 'sms'].includes(method)) {
    return <ErrorPage />;
  }

  return (
    <div className={styles.wrapper}>
      <NavBar />
      <div className={styles.container}>
        <div className={styles.title}>{t('description.reset_password')}</div>
        <div className={styles.description}>
          {t(`description.reset_password_description_${method === 'email' ? 'email' : 'sms'}`)}
        </div>
        {forgetPasswordForm}
      </div>
    </div>
  );
};

export default ForgetPassword;
