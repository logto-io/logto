import type { RoleResponse, RoleType } from '@logto/schemas';
import classNames from 'classnames';

import * as transferLayout from '@/scss/transfer.module.scss';

import SourceRolesBox from './components/SourceRolesBox';
import TargetRolesBox from './components/TargetRolesBox';
import * as styles from './index.module.scss';

type Props = {
  readonly entityId: string;
  readonly type: RoleType;
  readonly value: RoleResponse[];
  readonly onChange: (value: RoleResponse[]) => void;
};

function RolesTransfer({ entityId, type, value, onChange }: Props) {
  return (
    <div className={classNames(transferLayout.container, styles.rolesTransfer)}>
      <SourceRolesBox entityId={entityId} type={type} selectedRoles={value} onChange={onChange} />
      <div className={transferLayout.verticalBar} />
      <TargetRolesBox selectedRoles={value} onChange={onChange} />
    </div>
  );
}

export default RolesTransfer;
