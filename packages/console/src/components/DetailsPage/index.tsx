import type { AdminConsoleKey } from '@logto/phrases';
import classNames from 'classnames';
import type { ReactElement, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import Back from '@/assets/images/back.svg';
import type { RequestError } from '@/hooks/use-api';

import type DangerousRaw from '../DangerousRaw';
import DetailsSkeleton from '../DetailsSkeleton';
import RequestDataError from '../RequestDataError';
import TextLink from '../TextLink';

import * as styles from './index.module.scss';

type Props = {
  backLink: string;
  backLinkTitle?: AdminConsoleKey | ReactElement<typeof DangerousRaw>;
  isLoading?: boolean;
  error?: RequestError;
  onRetry?: () => void;
  children: ReactNode;
  className?: string;
};

function DetailsPage({
  backLink,
  backLinkTitle,
  isLoading,
  error,
  onRetry,
  children,
  className,
}: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={classNames(styles.container, className)}>
      <TextLink to={backLink} icon={<Back />} className={styles.backLink}>
        {typeof backLinkTitle === 'string' ? t(backLinkTitle) : backLinkTitle}
      </TextLink>
      {isLoading ? (
        <DetailsSkeleton />
      ) : error ? (
        <RequestDataError error={error} onRetry={onRetry} />
      ) : (
        children
      )}
    </div>
  );
}

export default DetailsPage;
