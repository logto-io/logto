import classNames from 'classnames';
import type { MouseEvent, KeyboardEvent, ReactNode } from 'react';

import { onKeyDownHandler } from '@/utils/a11y';

import Tooltip from '../Tip/Tooltip';

import styles from './DropdownItem.module.scss';

export type Props = {
  readonly onClick?: (event: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>) => void;
  readonly className?: string;
  readonly children: ReactNode;
  readonly icon?: ReactNode;
  readonly iconClassName?: string;
  readonly type?: 'default' | 'danger';
  readonly isDisabled?: boolean;
  readonly tooltip?: ReactNode;
};

function DropdownItem({
  onClick,
  className,
  children,
  icon,
  iconClassName,
  type = 'default',
  isDisabled = false,
  tooltip,
}: Props) {
  const item = (
    <div
      className={classNames(styles.item, styles[type], isDisabled && styles.disabled, className)}
      role="menuitem"
      tabIndex={0}
      aria-disabled={isDisabled}
      onMouseDown={(event) => {
        event.preventDefault();
      }}
      onKeyDown={
        isDisabled
          ? (event) => {
              if ([' ', 'Enter'].includes(event.key)) {
                event.preventDefault();
                event.stopPropagation();
              }
            }
          : onKeyDownHandler(onClick)
      }
      onClick={
        isDisabled
          ? (event) => {
              event.stopPropagation();
            }
          : onClick
      }
    >
      {icon && <span className={classNames(styles.icon, iconClassName)}>{icon}</span>}
      {children}
    </div>
  );

  if (isDisabled && tooltip) {
    return (
      <Tooltip anchorClassName={styles.tooltipAnchor} placement="right" content={tooltip}>
        {item}
      </Tooltip>
    );
  }

  return item;
}

export default DropdownItem;
