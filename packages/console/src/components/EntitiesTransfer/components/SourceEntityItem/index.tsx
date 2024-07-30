import { type ReactNode } from 'react';

import Checkbox from '@/ds-components/Checkbox';
import { type Identifiable } from '@/types/general';
import { onKeyDownHandler } from '@/utils/a11y';

import styles from './index.module.scss';

type Props<T> = {
  readonly entity: T;
  readonly isSelected: boolean;
  readonly onSelect: () => void;
  readonly render: (entity: T) => ReactNode;
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
