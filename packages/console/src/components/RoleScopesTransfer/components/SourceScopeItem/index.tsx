import type { ScopeResponse } from '@logto/schemas';

import Checkbox from '@/components/Checkbox';
import { onKeyDownHandler } from '@/utilities/a11y';

import * as styles from './index.module.scss';

type Props = {
  scope: ScopeResponse;
  isSelected: boolean;
  onSelect: (scope: ScopeResponse) => void;
};

const SourceScopeItem = ({ scope, scope: { name }, isSelected, onSelect }: Props) => (
  <div className={styles.sourceScopeItem}>
    <Checkbox
      checked={isSelected}
      onChange={() => {
        onSelect(scope);
      }}
    />
    <div
      className={styles.name}
      role="button"
      tabIndex={0}
      onKeyDown={onKeyDownHandler(() => {
        onSelect(scope);
      })}
      onClick={() => {
        onSelect(scope);
      }}
    >
      {name}
    </div>
  </div>
);

export default SourceScopeItem;
