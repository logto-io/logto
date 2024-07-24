import { Theme } from '@logto/schemas';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import RequestErrorDarkImage from '@/assets/images/request-error-dark.svg?react';
import RequestErrorImage from '@/assets/images/request-error.svg?react';
import Button from '@/ds-components/Button';
import Card from '@/ds-components/Card';
import type { RequestError } from '@/hooks/use-api';
import useTheme from '@/hooks/use-theme';

import styles from './index.module.scss';

type Props = {
  readonly error: RequestError;
  readonly onRetry?: () => void;
  readonly className?: string;
};

function RequestDataError({ error, onRetry, className }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const theme = useTheme();
  const errorMessage = error.body?.message ?? error.message;
  const isNotFoundError = error.status === 404;
  const ErrorImage = theme === Theme.Light ? RequestErrorImage : RequestErrorDarkImage;

  return (
    <Card className={classNames(styles.error, className)}>
      <ErrorImage className={styles.image} />
      <div className={styles.title}>
        {t(isNotFoundError ? 'errors.not_found' : 'errors.something_went_wrong')}
      </div>
      <div className={styles.content}>{errorMessage}</div>
      {onRetry && <Button title="general.retry" onClick={onRetry} />}
    </Card>
  );
}

export default RequestDataError;
