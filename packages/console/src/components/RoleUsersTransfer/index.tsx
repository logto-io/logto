import type { User } from '@logto/schemas';
import classNames from 'classnames';

import * as transferLayout from '@/scss/transfer.module.scss';

import SourceUsersBox from './components/SourceUsersBox';
import TargetUsersBox from './components/TargetUsersBox';
import * as styles from './index.module.scss';

type Props = {
  roleId: string;
  value: User[];
  onChange: (value: User[]) => void;
};

function RoleUsersTransfer({ roleId, value, onChange }: Props) {
  return (
    <div className={classNames(transferLayout.container, styles.roleUsersTransfer)}>
      <SourceUsersBox roleId={roleId} selectedUsers={value} onChange={onChange} />
      <div className={transferLayout.verticalBar} />
      <TargetUsersBox selectedUsers={value} onChange={onChange} />
    </div>
  );
}

export default RoleUsersTransfer;
