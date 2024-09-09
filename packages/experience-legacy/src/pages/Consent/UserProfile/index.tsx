import { type ConsentInfoResponse } from '@logto/schemas';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import UserAvatar from '@/assets/icons/default-user-avatar.svg?react';

import styles from './index.module.scss';

type Props = {
  readonly user: ConsentInfoResponse['user'];
  readonly className?: string;
};

const UserProfile = ({
  user: { id, avatar, name, primaryEmail, primaryPhone, username },
  className,
}: Props) => {
  const { t } = useTranslation();

  return (
    <div className={classNames(styles.wrapper, className)}>
      {avatar ? (
        <img src={avatar} alt="avatar" className={styles.avatar} />
      ) : (
        <UserAvatar className={styles.avatar} />
      )}
      <div>
        <div className={styles.name}>{name ?? t('description.user_id', { id })}</div>
        <div className={styles.identifier}>{primaryEmail ?? primaryPhone ?? username}</div>
      </div>
    </div>
  );
};

export default UserProfile;
