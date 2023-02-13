import classNames from 'classnames';
import type { MouseEvent, KeyboardEvent, ReactNode } from 'react';

import { onKeyDownHandler } from '@/utils/a11y';

import * as styles from './DropdownItem.module.scss';

type Props = {
  onClick?: (event: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>) => void;
  className?: string;
  children: ReactNode | Record<string, unknown>;
  icon?: ReactNode;
  iconClassName?: string;
  type?: 'default' | 'danger';
};

const DropdownItem = ({
  onClick,
  className,
  children,
  icon,
  iconClassName,
  type = 'default',
}: Props) => (
  <div
    className={classNames(styles.item, styles[type], className)}
    role="menuitem"
    tabIndex={0}
    onKeyDown={onKeyDownHandler(onClick)}
    onClick={onClick}
  >
    {icon && <span className={classNames(styles.icon, iconClassName)}>{icon}</span>}
    {children}
  </div>
);

export default DropdownItem;
