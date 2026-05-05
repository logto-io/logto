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
      tabIndex={isDisabled ? -1 : 0}
      aria-disabled={isDisabled}
      onMouseDown={(event) => {
        event.preventDefault();
      }}
      onKeyDown={isDisabled ? undefined : onKeyDownHandler(onClick)}
      onClick={isDisabled ? undefined : onClick}
    >
      {icon && <span className={classNames(styles.icon, iconClassName)}>{icon}</span>}
      {children}
    </div>
  );

  if (isDisabled && tooltip) {
    return (
      <Tooltip placement="right" content={tooltip}>
        {item}
      </Tooltip>
    );
  }

  return item;
}

export default DropdownItem;
