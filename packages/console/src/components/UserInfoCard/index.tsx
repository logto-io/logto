import type { IdTokenClaims } from '@logto/react';
import type { User } from '@logto/schemas';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import UserAvatar from '../UserAvatar';

import * as styles from './index.module.scss';

type Props = {
  readonly className?: string;
  readonly user?: Partial<
    Pick<User, 'name' | 'username' | 'avatar' | 'primaryEmail'> &
      Pick<IdTokenClaims, 'picture' | 'email'>
  >;
  readonly avatarSize?: 'medium' | 'large';
};

function UserInfoCard({ className, user, avatarSize = 'medium' }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const { name, username, avatar, picture, primaryEmail, email } = user ?? {};
  const avatarToDisplay = avatar ?? picture;
  const nameToDisplay = name ?? username;
  const emailToDisplay = primaryEmail ?? email;

  return (
    <div className={classNames(styles.userInfo, className)}>
      <UserAvatar
        size={avatarSize}
        user={{ name, username, avatar: avatarToDisplay, primaryEmail: emailToDisplay }}
      />
      <div className={styles.nameWrapper}>
        <div className={styles.name}>{nameToDisplay}</div>
        {emailToDisplay && <div className={styles.email}>{emailToDisplay}</div>}
        {!nameToDisplay && !emailToDisplay && (
          <div className={styles.email}>({t('profile.link_account.anonymous')})</div>
        )}
      </div>
    </div>
  );
}

export default UserInfoCard;
