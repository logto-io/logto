import type { User } from '@logto/schemas';

import Close from '@/assets/icons/close.svg';
import IconButton from '@/components/IconButton';
import UserAvatar from '@/components/UserAvatar';
import SuspendedTag from '@/pages/Users/components/SuspendedTag';
import { getUserTitle } from '@/utils/user';

import * as styles from './index.module.scss';

type Props = {
  user: User;
  onDelete: () => void;
};

function TargetUserItem({ user, onDelete }: Props) {
  return (
    <div className={styles.item}>
      <div className={styles.meta}>
        <UserAvatar hasTooltip user={user} size="micro" />
        <div className={styles.title}>{getUserTitle(user)}</div>
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
