import type { ScopeResponse } from '@logto/schemas';

import Close from '@/assets/icons/close.svg?react';
import IconButton from '@/ds-components/IconButton';

import styles from './index.module.scss';

type Props = {
  readonly scope: ScopeResponse;
  readonly onDelete: (scope: ScopeResponse) => void;
};

function TargetScopeItem({ scope, onDelete }: Props) {
  const {
    name,
    resource: { name: resourceName },
  } = scope;

  return (
    <div className={styles.targetScopeItem}>
      <div className={styles.title}>
        <div className={styles.name}>{name}</div>
        <div className={styles.resourceName}>{`(${resourceName})`}</div>
      </div>
      <IconButton
        size="small"
        onClick={() => {
          onDelete(scope);
        }}
      >
        <Close />
      </IconButton>
    </div>
  );
}

export default TargetScopeItem;
