import type { User } from '@logto/schemas';
import { useTranslation } from 'react-i18next';

import Close from '@/assets/images/close.svg';
import IconButton from '@/components/IconButton';
import UserAvatar from '@/components/UserAvatar';
import SuspendedTag from '@/pages/Users/components/SuspendedTag';
import { getUserPrimaryIdentity } from '@/utils/user';

import * as styles from './index.module.scss';

type Props = {
  user: User;
  onDelete: () => void;
};

function TargetUserItem({ user, onDelete }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={styles.item}>
      <div className={styles.meta}>
        <UserAvatar user={user} size="micro" />
        <div className={styles.identity}>{getUserPrimaryIdentity(user) ?? t('users.unnamed')}</div>
        {user.isSuspended && <SuspendedTag className={styles.suspended} />}
      </div>
      <IconButton
        size="small"
        iconClassName={styles.icon}
        onClick={() => {
          onDelete();
        }}
      >
        <Close />
      </IconButton>
    </div>
  );
}

export default TargetUserItem;
