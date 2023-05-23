import type { User } from '@logto/schemas';
import { conditionalString } from '@silverhand/essentials';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import useSWR from 'swr';

import type { RequestError } from '@/hooks/use-api';
import { getUserTitle } from '@/utils/user';

import UserAvatar from '../UserAvatar';

import * as styles from './index.module.scss';

type Props = {
  userId: string;
  isLink?: boolean;
};

function UserName({ userId, isLink = false }: Props) {
  const { data, error } = useSWR<User, RequestError>(`api/users/${userId}`);
  const isLoading = !data && !error;
  const name = conditionalString(data && getUserTitle(data));

  if (isLoading) {
    return null;
  }

  return (
    <div className={styles.userName}>
      {isLink ? (
        <Link to={`/users/${userId}`} className={classNames(styles.title, styles.link)}>
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
