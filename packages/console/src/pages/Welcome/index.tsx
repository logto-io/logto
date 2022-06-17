import { LogtoClientError, useLogto } from '@logto/react';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useHref } from 'react-router-dom';

import WelcomeIcon from '@/assets/images/welcome-icon.svg';
import AppError from '@/components/AppError';
import Button from '@/components/Button';
import SessionExpired from '@/components/SessionExpired';
import Logo from '@/icons/Logo';

import * as styles from './index.module.scss';

const Welcome = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const navigate = useNavigate();
  const { isAuthenticated, error, signIn } = useLogto();
  const href = useHref('/callback');

  useEffect(() => {
    // If Authenticated, navigate to the Admin Console root page. directly
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  if (error) {
    if (error instanceof LogtoClientError) {
      return <SessionExpired />;
    }

    return <AppError errorMessage={error.message} callStack={error.stack} />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Logo className={styles.logo} />
      </div>
      <main>
        <img src={WelcomeIcon} alt="welcome" className={styles.icon} />
        <div className={styles.title}>{t('welcome.title')}</div>
        <div className={styles.description}>{t('welcome.description')}</div>
        <Button
          className={styles.button}
          size="large"
          type="primary"
          title="admin_console.welcome.create_account"
          onClick={() => {
            void signIn(new URL(href, window.location.origin).toString());
          }}
        />
      </main>
    </div>
  );
};

export default Welcome;
