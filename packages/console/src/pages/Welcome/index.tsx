import { LogtoClientError, useLogto } from '@logto/react';
import classNames from 'classnames';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import Logo from '@/assets/images/logo.svg';
import AppError from '@/components/AppError';
import SessionExpired from '@/components/SessionExpired';
import { getCallbackUrl } from '@/consts';
import Button from '@/ds-components/Button';
import useTheme from '@/hooks/use-theme';

import * as styles from './index.module.scss';

function Welcome() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const navigate = useNavigate();
  const { isAuthenticated, error, signIn } = useLogto();
  const theme = useTheme();

  useEffect(() => {
    // If Authenticated, navigate to the Admin Console root page. directly
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  if (error) {
    if (error instanceof LogtoClientError) {
      return <SessionExpired error={error} />;
    }

    return <AppError errorMessage={error.message} callStack={error.stack} />;
  }

  return (
    <div className={classNames(styles.container, styles[theme])}>
      <div className={styles.header}>
        <Logo className={styles.logo} />
      </div>
      <main>
        <div className={styles.placeholderTop} />
        <div className={styles.content}>
          <div className={styles.title}>{t('welcome.title')}</div>
          <div className={styles.description}>{t('welcome.description')}</div>
          <Button
            className={styles.button}
            size="large"
            type="branding"
            title="welcome.create_account"
            onClick={() => {
              void signIn(getCallbackUrl().href);
            }}
          />
        </div>
        <div className={styles.placeholderBottom} />
      </main>
    </div>
  );
}

export default Welcome;
