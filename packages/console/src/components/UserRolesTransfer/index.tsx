import type { RoleResponse } from '@logto/schemas';
import classNames from 'classnames';

import * as transferLayout from '@/scss/transfer.module.scss';

import SourceRolesBox from './components/SourceRolesBox';
import TargetRolesBox from './components/TargetRolesBox';
import * as styles from './index.module.scss';

type Props = {
  userId: string;
  value: RoleResponse[];
  onChange: (value: RoleResponse[]) => void;
};

function UserRolesTransfer({ userId, value, onChange }: Props) {
  return (
    <div className={classNames(transferLayout.container, styles.rolesTransfer)}>
      <SourceRolesBox userId={userId} selectedRoles={value} onChange={onChange} />
      <div className={transferLayout.verticalBar} />
      <TargetRolesBox selectedRoles={value} onChange={onChange} />
    </div>
  );
}

export default UserRolesTransfer;
