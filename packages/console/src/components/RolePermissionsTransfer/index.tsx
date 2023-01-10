import type { ScopeResponse } from '@logto/schemas';

import SourcePermissionsBox from './SourcePermissionsBox';
import TargetPermissionsBox from './TargetPermissionsBox';
import * as styles from './index.module.scss';

type Props = {
  value: ScopeResponse[];
  onChange: (value: ScopeResponse[]) => void;
  excludeScopeIds?: string[];
};

const RolePermissionsTransfer = ({ excludeScopeIds = [], value, onChange }: Props) => (
  <div className={styles.container}>
    <SourcePermissionsBox
      excludeScopeIds={excludeScopeIds}
      selectedPermissions={value}
      onChange={onChange}
    />
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
