import type { ScopeResponse } from '@logto/schemas';

import SourcePermissionsBox from './SourcePermissionsBox';
import TargetPermissionsBox from './TargetPermissionsBox';
import * as styles from './index.module.scss';

type Props = {
  value: ScopeResponse[];
  onChange: (value: ScopeResponse[]) => void;
};

const RolePermissionsTransfer = ({ value, onChange }: Props) => (
  <div className={styles.container}>
    <SourcePermissionsBox selectedPermissions={value} onChange={onChange} />
    <div className={styles.verticalBar} />
    <TargetPermissionsBox
      selectedScopes={value}
      onRemovePermission={(scope) => {
        onChange(value.filter(({ id }) => id !== scope.id));
      }}
    />
  </div>
);

export default RolePermissionsTransfer;
