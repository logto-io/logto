import classNames from 'classnames';
import { type ReactNode } from 'react';

import Draggable from '@/assets/icons/draggable.svg?react';
import Minus from '@/assets/icons/minus.svg?react';
import IconButton from '@/ds-components/IconButton';
import Tooltip from '@/ds-components/Tip/Tooltip';

import styles from './ProfileFieldItem.module.scss';

type Props = {
  readonly label: string;
  readonly onDelete: () => void;
  readonly isDisabled?: boolean;
  readonly disabledHint?: ReactNode;
};

function ProfileFieldItem({ label, onDelete, isDisabled = false, disabledHint }: Props) {
  const fieldRow = (
    <div className={classNames(styles.profileField, isDisabled && styles.disabled)}>
      <Draggable className={styles.draggableIcon} />
      {label}
    </div>
  );

  return (
    <div className={styles.profileFieldItem}>
      {isDisabled && disabledHint ? (
        <Tooltip anchorClassName={styles.tooltipAnchor} placement="top" content={disabledHint}>
          {fieldRow}
        </Tooltip>
      ) : (
        fieldRow
      )}
      <IconButton disabled={isDisabled} onClick={onDelete}>
        <Minus />
      </IconButton>
    </div>
  );
}

export default ProfileFieldItem;
