import type { User } from '@logto/schemas';

import UserAvatar from '@/components/UserAvatar';
import Checkbox from '@/ds-components/Checkbox';
import SuspendedTag from '@/pages/Users/components/SuspendedTag';
import { onKeyDownHandler } from '@/utils/a11y';
import { getUserTitle } from '@/utils/user';

import * as styles from './index.module.scss';

type Props = {
  user: User;
  isSelected: boolean;
  onSelect: () => void;
};

function SourceUserItem({ user, isSelected, onSelect }: Props) {
  return (
    <div
      role="button"
      tabIndex={0}
      className={styles.item}
      onKeyDown={onKeyDownHandler(() => {
        onSelect();
      })}
      onClick={() => {
        onSelect();
      }}
    >
      <Checkbox
        checked={isSelected}
        onChange={() => {
          onSelect();
        }}
      />
      <UserAvatar hasTooltip user={user} size="micro" />
      <div className={styles.title}>{getUserTitle(user)}</div>
      {user.isSuspended && <SuspendedTag className={styles.suspended} />}
    </div>
  );
}

export default SourceUserItem;
