import Close from '@/assets/icons/close.svg';
import IconButton from '@/ds-components/IconButton';

import { type SelectedScopeAssignmentScopeDataType } from '../type';

import * as styles from './index.module.scss';

type Props = {
  // ResourceName is only used by the resource scope assignment form
  scope: SelectedScopeAssignmentScopeDataType;
  onDelete: (scope: SelectedScopeAssignmentScopeDataType) => void;
};

function TargetScopeItem({ scope, onDelete }: Props) {
  const { name, resourceName } = scope;

  return (
    <div className={styles.targetScopeItem}>
      <div className={styles.title}>
        <div className={styles.name}>{name}</div>
        {resourceName && <div className={styles.resourceName}>{resourceName}</div>}
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
