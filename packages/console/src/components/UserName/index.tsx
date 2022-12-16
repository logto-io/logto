import type { UserWithRoleNames } from '@logto/schemas';
import { UserRole } from '@logto/schemas';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import useSWR from 'swr';

import type { RequestError } from '@/hooks/use-api';

import * as styles from './index.module.scss';

type Props = {
  userId: string;
  isLink?: boolean;
};

const UserName = ({ userId, isLink = false }: Props) => {
  const { data, error } = useSWR<UserWithRoleNames, RequestError>(`/api/users/${userId}`);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const isLoading = !data && !error;
  const name = data?.name ?? t('users.unnamed');

  const isAdmin = data?.roleNames.includes(UserRole.Admin);

  if (isLoading) {
    return null;
  }

  return (
    <div className={styles.userName}>
      {isLink && !isAdmin ? (
        <Link to={`/users/${userId}`} target="_blank" className={styles.link}>
          {name}
        </Link>
      ) : (
        <span>
          {name}
          {isAdmin && <> ({t('admin_user')})</>}
        </span>
      )}
      <span className={styles.userId}>{userId}</span>
    </div>
  );
};

export default UserName;
