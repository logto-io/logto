import type { IdTokenClaims } from '@logto/react';
import type { User } from '@logto/schemas';
import classNames from 'classnames';

import UserAvatar from '../UserAvatar';
import * as styles from './index.module.scss';

type Props = {
  className?: string;
  user: Partial<
    Pick<User, 'name' | 'username' | 'avatar' | 'primaryEmail'> &
      Pick<IdTokenClaims, 'picture' | 'email'>
  >;
  avatarSize?: 'small' | 'medium' | 'large';
};

const UserInfoCard = ({ className, user, avatarSize = 'medium' }: Props) => {
  const { name, username, avatar, picture, primaryEmail, email } = user;
  const avatarToDisplay = avatar ?? picture;
  const emailToDisplay = primaryEmail ?? email;

  return (
    <div className={classNames(styles.userInfo, className)}>
      <UserAvatar className={styles.avatar} url={avatarToDisplay} size={avatarSize} />
      <div className={styles.nameWrapper}>
        <div className={styles.name}>{name ?? username}</div>
        {emailToDisplay && <div className={styles.email}>{emailToDisplay}</div>}
      </div>
    </div>
  );
};

export default UserInfoCard;
