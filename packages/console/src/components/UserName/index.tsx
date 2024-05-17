import type { User } from '@logto/schemas';
import { conditionalString } from '@silverhand/essentials';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import useSWR from 'swr';

import type { RequestError } from '@/hooks/use-api';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import { getUserTitle } from '@/utils/user';

import UserAvatar from '../UserAvatar';

import * as styles from './index.module.scss';

type Props = {
  readonly userId: string;
  readonly isLink?: boolean;
};

function UserName({ userId, isLink = false }: Props) {
  const { data, error } = useSWR<User, RequestError>(`api/users/${userId}`);
  const isLoading = !data && !error;
  const name = conditionalString(data && getUserTitle(data));
  const { getTo } = useTenantPathname();

  if (isLoading) {
    return null;
  }

  return (
    <div className={styles.userName}>
      {isLink ? (
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
