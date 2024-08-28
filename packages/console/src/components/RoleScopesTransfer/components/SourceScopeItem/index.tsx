import type { ScopeResponse } from '@logto/schemas';

import Checkbox from '@/ds-components/Checkbox';
import { onKeyDownHandler } from '@/utils/a11y';

import * as styles from './index.module.scss';

type Props = {
  readonly scope: ScopeResponse;
  readonly isSelected: boolean;
  readonly onSelect: (scope: ScopeResponse) => void;
};

function SourceScopeItem({ scope, scope: { name }, isSelected, onSelect }: Props) {
  return (
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
}

export default SourceScopeItem;
