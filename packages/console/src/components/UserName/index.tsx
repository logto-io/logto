import type { User } from '@logto/schemas';
import classNames from 'classnames';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import useSWR from 'swr';

import type { RequestError } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import useSwrFetcher from '@/hooks/use-swr-fetcher';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import { shouldRetryOnError } from '@/utils/request';
import { getUserTitle } from '@/utils/user';

import UserAvatar from '../UserAvatar';

import * as styles from './index.module.scss';

type Props = {
  readonly userId: string;
  readonly isLink?: boolean;
};

function UserName({ userId, isLink = false }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const fetchApi = useApi({ hideErrorToast: ['entity.not_found'] });
  const fetcher = useSwrFetcher<User>(fetchApi);
  const { data, error } = useSWR<User, RequestError>(`api/users/${userId}`, {
    fetcher,
    shouldRetryOnError: shouldRetryOnError({ ignore: [404] }),
  });
  const { getTo } = useTenantPathname();

  const name = useMemo(() => {
    if (data) {
      return getUserTitle(data);
    }
    if (error?.status === 404) {
      return `${userId} (${t('general.deleted')})`;
    }
    return '-';
  }, [userId, data, error?.status, t]);

  return (
    <div className={styles.userName}>
      {isLink && data ? (
        <Link to={getTo(`/users/${userId}`)} className={classNames(styles.title, styles.link)}>
          <UserAvatar hasTooltip size="micro" user={data} />
          <span>{name}</span>
        </Link>
      ) : (
        <div className={styles.title}>{name}</div>
      )}
    </div>
  );
}

export default UserName;
