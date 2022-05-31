import { User } from '@logto/schemas';
import React from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import { RequestError } from '@/hooks/use-api';

import * as styles from './index.module.scss';

type Props = {
  userId: string;
};

const UserName = ({ userId }: Props) => {
  const { data, error } = useSWR<User, RequestError>(`/api/users/${userId}`);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const isLoading = !data && !error;

  if (isLoading) {
    return null;
  }

  return (
    <div className={styles.userName}>
      <span>{data?.name ?? t('users.unnamed')}</span>
      <span className={styles.userId}>{userId}</span>
    </div>
  );
};

export default UserName;
