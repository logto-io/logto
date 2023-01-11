import type { ScopeResponse } from '@logto/schemas';

import Close from '@/assets/images/close.svg';
import IconButton from '@/components/IconButton';

import * as styles from './index.module.scss';

export type Props = {
  scope: ScopeResponse;
  onDelete: () => void;
};

const TargetPermissionItem = ({ scope, onDelete }: Props) => {
  const {
    name,
    resource: { name: resourceName },
  } = scope;

  return (
    <div className={styles.targetPermissionItem}>
      <div className={styles.title}>
        <div className={styles.name}>{name}</div>
        <div className={styles.resourceName}>{`(${resourceName})`}</div>
      </div>
      <IconButton size="small" iconClassName={styles.icon} onClick={onDelete}>
        <Close />
      </IconButton>
    </div>
  );
};

export default TargetPermissionItem;
