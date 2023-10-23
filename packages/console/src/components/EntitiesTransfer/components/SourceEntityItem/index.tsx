import { type ReactNode } from 'react';

import Checkbox from '@/ds-components/Checkbox';
import { type Identifiable } from '@/types/general';
import { onKeyDownHandler } from '@/utils/a11y';

import * as styles from './index.module.scss';

type Props<T> = {
  entity: T;
  isSelected: boolean;
  onSelect: () => void;
  render: (entity: T) => ReactNode;
};

function SourceEntityItem<T extends Identifiable>({
  entity,
  isSelected,
  onSelect,
  render,
}: Props<T>) {
  return (
    <div
      role="button"
      tabIndex={0}
      className={styles.item}
      onKeyDown={onKeyDownHandler(() => {
        onSelect();
      })}
      onClick={() => {
        onSelect();
      }}
    >
      <Checkbox
        checked={isSelected}
        onChange={() => {
          onSelect();
        }}
      />
      {render(entity)}
    </div>
  );
}

export default SourceEntityItem;
