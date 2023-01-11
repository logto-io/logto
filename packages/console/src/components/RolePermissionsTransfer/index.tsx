import type { ScopeResponse } from '@logto/schemas';
import classNames from 'classnames';

import * as transferLayout from '@/scss/transfer.module.scss';

import SourcePermissionsBox from './components/SourcePermissionsBox';
import TargetPermissionsBox from './components/TargetPermissionsBox';
import * as styles from './index.module.scss';

type Props = {
  roleId?: string;
  value: ScopeResponse[];
  onChange: (value: ScopeResponse[]) => void;
};

const RolePermissionsTransfer = ({ roleId, value, onChange }: Props) => (
  <div className={classNames(transferLayout.container, styles.rolePermissionsTransfer)}>
    <SourcePermissionsBox roleId={roleId} selectedPermissions={value} onChange={onChange} />
    <div className={transferLayout.verticalBar} />
    <TargetPermissionsBox selectedScopes={value} onChange={onChange} />
  </div>
);

export default RolePermissionsTransfer;
