import classNames from 'classnames';
import type { KeyboardEvent, ReactNode } from 'react';

import Draggable from '@/assets/icons/draggable.svg?react';
import Minus from '@/assets/icons/minus.svg?react';
import IconButton from '@/ds-components/IconButton';
import Tooltip from '@/ds-components/Tip/Tooltip';

import styles from './ProfileFieldItem.module.scss';

const preventDisabledRowActivation = (event: KeyboardEvent<HTMLDivElement>) => {
  if ([' ', 'Enter'].includes(event.key)) {
    event.preventDefault();
    event.stopPropagation();
  }
};

type Props = {
  readonly label: string;
  readonly onDelete: () => void;
  readonly isDisabled?: boolean;
  readonly disabledHint?: ReactNode;
};

function ProfileFieldItem({ label, onDelete, isDisabled = false, disabledHint }: Props) {
  const shouldShowDisabledHint = isDisabled && Boolean(disabledHint);
  const fieldRow = (
    <div
      className={classNames(styles.profileField, isDisabled && styles.disabled)}
      aria-disabled={isDisabled || undefined}
      role={shouldShowDisabledHint ? 'button' : undefined}
      tabIndex={shouldShowDisabledHint ? 0 : undefined}
      onKeyDown={shouldShowDisabledHint ? preventDisabledRowActivation : undefined}
    >
      <Draggable className={styles.draggableIcon} />
      {label}
    </div>
  );

  return (
    <div className={styles.profileFieldItem}>
      {shouldShowDisabledHint ? (
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
