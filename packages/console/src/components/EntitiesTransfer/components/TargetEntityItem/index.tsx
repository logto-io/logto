import { type ReactNode } from 'react';

import Close from '@/assets/icons/close.svg';
import IconButton from '@/ds-components/IconButton';
import { type Identifiable } from '@/types/general';

import * as styles from './index.module.scss';

type Props<T> = {
  readonly entity: T;
  readonly render: (entity: T) => ReactNode;
  readonly onDelete: () => void;
};

function TargetEntityItem<T extends Identifiable>({ entity, render, onDelete }: Props<T>) {
  return (
    <div className={styles.item}>
      <div className={styles.meta}>{render(entity)}</div>
      <IconButton
        size="small"
        onClick={() => {
          onDelete();
        }}
      >
        <Close />
      </IconButton>
    </div>
  );
}

export default TargetEntityItem;
