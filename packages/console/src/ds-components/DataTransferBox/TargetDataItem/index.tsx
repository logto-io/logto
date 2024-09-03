import Close from '@/assets/icons/close.svg?react';
import IconButton from '@/ds-components/IconButton';

import { type DataEntry, type SelectedDataEntry } from '../type';

import styles from './index.module.scss';

type Props<TEntry extends DataEntry> = {
  readonly data: SelectedDataEntry<TEntry>;
  readonly onDelete: (data: SelectedDataEntry<TEntry>) => void;
};

function TargetDataItem<TEntry extends DataEntry>({ data, onDelete }: Props<TEntry>) {
  const { name } = data;
  const groupName = 'groupName' in data ? data.groupName : undefined;

  return (
    <div className={styles.targetDataItem}>
      <div className={styles.title}>
        <div className={styles.name}>{name}</div>
        {groupName && <div className={styles.groupName}>{groupName}</div>}
      </div>
      <IconButton
        size="small"
        onClick={() => {
          onDelete(data);
        }}
      >
        <Close />
      </IconButton>
    </div>
  );
}

export default TargetDataItem;
