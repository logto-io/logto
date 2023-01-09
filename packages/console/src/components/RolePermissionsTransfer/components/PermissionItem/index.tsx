import type { ScopeResponse } from '@logto/schemas';

import Checkbox from '@/components/Checkbox';
import { onKeyDownHandler } from '@/utilities/a11y';

import * as styles from './index.module.scss';

type Props = {
  scope: ScopeResponse;
  isSelected: boolean;
  onSelectPermission: (scope: ScopeResponse) => void;
};

const PermissionItem = ({ scope, isSelected, onSelectPermission }: Props) => {
  const { name } = scope;

  return (
    <div
      className={styles.permissionItem}
      role="button"
      tabIndex={0}
      onKeyDown={onKeyDownHandler(() => {
        onSelectPermission(scope);
      })}
      onClick={() => {
        onSelectPermission(scope);
      }}
    >
      <Checkbox
        checked={isSelected}
        disabled={false}
        onChange={() => {
          onSelectPermission(scope);
        }}
      />
      <div className={styles.name}>{name}</div>
    </div>
  );
};

export default PermissionItem;
