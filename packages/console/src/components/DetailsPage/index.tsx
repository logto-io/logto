import type { AdminConsoleKey } from '@logto/phrases';
import classNames from 'classnames';
import type { ReactElement, ReactNode } from 'react';

import Back from '@/assets/icons/back.svg';
import type DangerousRaw from '@/ds-components/DangerousRaw';
import DynamicT from '@/ds-components/DynamicT';
import TextLink from '@/ds-components/TextLink';
import type { RequestError } from '@/hooks/use-api';

import RequestDataError from '../RequestDataError';

import Skeleton from './Skeleton';
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
  return (
    <div className={classNames(styles.container, className)}>
      <TextLink to={backLink} icon={<Back />} className={styles.backLink}>
        {typeof backLinkTitle === 'string' ? <DynamicT forKey={backLinkTitle} /> : backLinkTitle}
      </TextLink>
      {isLoading ? (
        <Skeleton />
      ) : error ? (
        <RequestDataError error={error} onRetry={onRetry} />
      ) : (
        children
      )}
    </div>
  );
}

export default DetailsPage;
