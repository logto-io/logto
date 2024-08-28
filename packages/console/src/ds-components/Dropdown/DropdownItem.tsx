import classNames from 'classnames';
import type { MouseEvent, KeyboardEvent, ReactNode } from 'react';

import { onKeyDownHandler } from '@/utils/a11y';

import * as styles from './DropdownItem.module.scss';

export type Props = {
  readonly onClick?: (event: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>) => void;
  readonly className?: string;
  readonly children: ReactNode;
  readonly icon?: ReactNode;
  readonly iconClassName?: string;
  readonly type?: 'default' | 'danger';
};

function DropdownItem({
  onClick,
  className,
  children,
  icon,
  iconClassName,
  type = 'default',
}: Props) {
  return (
    <div
      className={classNames(styles.item, styles[type], className)}
      role="menuitem"
      tabIndex={0}
      onMouseDown={(event) => {
        event.preventDefault();
      }}
      onKeyDown={onKeyDownHandler(onClick)}
      onClick={onClick}
    >
      {icon && <span className={classNames(styles.icon, iconClassName)}>{icon}</span>}
      {children}
    </div>
  );
}

export default DropdownItem;
