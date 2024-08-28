import Checkbox from '@/ds-components/Checkbox';
import { onKeyDownHandler } from '@/utils/a11y';

import type { DataEntry } from '../type';

import * as styles from './index.module.scss';

type Props<TEntry extends DataEntry> = {
  readonly data: TEntry;
  readonly isSelected: boolean;
  readonly onSelect: (data: TEntry) => void;
};

function SourceDataItem<TEntry extends DataEntry>({ data, isSelected, onSelect }: Props<TEntry>) {
  return (
    <div className={styles.dataItem}>
      <Checkbox
        checked={isSelected}
        onChange={() => {
          onSelect(data);
        }}
      />
      <div
        className={styles.name}
        role="button"
        tabIndex={0}
        onKeyDown={onKeyDownHandler(() => {
          onSelect(data);
        })}
        onClick={() => {
          onSelect(data);
        }}
      >
        {data.name}
      </div>
    </div>
  );
}

export default SourceDataItem;
