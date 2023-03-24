import { useLogto } from '@logto/react';
import { useTranslation } from 'react-i18next';

import * as styles from './index.module.scss';
import AppError from '../AppError';
import Button from '../Button';

type Props = {
  error: Error;
  callbackHref?: string;
};

function SessionExpired({ callbackHref = '/callback', error }: Props) {
  const { signIn, signOut } = useLogto();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <AppError
      title={t('session_expired.title')}
      errorMessage={t('session_expired.subtitle')}
      callStack={error.stack}
    >
      <Button
        className={styles.retryButton}
        size="large"
        type="outline"
        title="session_expired.button"
        onClick={() => {
          void signIn(new URL(callbackHref, window.location.origin).toString());
        }}
      />
    </AppError>
  );
}

export default SessionExpired;
