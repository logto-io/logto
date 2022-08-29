import { useLogto } from '@logto/react';
import { useTranslation } from 'react-i18next';
import { useHref } from 'react-router-dom';

import AppError from '../AppError';
import Button from '../Button';
import * as styles from './index.module.scss';

const SessionExpired = () => {
  const { error, signIn } = useLogto();
  const href = useHref('/callback');
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <AppError
      title={t('session_expired.title')}
      errorMessage={t('session_expired.subtitle')}
      callStack={error?.stack}
    >
      <Button
        className={styles.retryButton}
        size="large"
        type="outline"
        title="session_expired.button"
        onClick={() => {
          void signIn(new URL(href, window.location.origin).toString());
        }}
      />
    </AppError>
  );
};

export default SessionExpired;
