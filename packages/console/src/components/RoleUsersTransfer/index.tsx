import type { User } from '@logto/schemas';

import SourceUsersBox from './SourceUsersBox';
import TargetUsersBox from './TargetUsersBox';
import * as styles from './index.module.scss';

type Props = {
  roleId: string;
  value: User[];
  onChange: (value: User[]) => void;
};

const RoleUsersTransfer = ({ roleId, value, onChange }: Props) => {
  const onAddUser = (user: User) => {
    onChange([user, ...value]);
  };

  const onRemoveUser = (user: User) => {
    onChange(value.filter(({ id }) => id !== user.id));
  };

  return (
    <div className={styles.container}>
      <SourceUsersBox
        roleId={roleId}
        selectedUsers={value}
        onAddUser={onAddUser}
        onRemoveUser={onRemoveUser}
      />
      <div className={styles.verticalBar} />
      <TargetUsersBox selectedUsers={value} onRemoveUser={onRemoveUser} />
    </div>
  );
};

export default RoleUsersTransfer;
