import classNames from 'classnames';
import type { MouseEvent, KeyboardEvent, ReactNode } from 'react';

import { onKeyDownHandler } from '@/utilities/a11y';

import * as styles from './DropdownItem.module.scss';

type Props = {
  onClick?: (event: MouseEvent<HTMLLIElement> | KeyboardEvent<HTMLLIElement>) => void;
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
  <li
    role="menuitem"
    tabIndex={0}
    className={classNames(styles.item, styles[type], className)}
    onKeyDown={onKeyDownHandler(onClick)}
    onClick={onClick}
  >
    {icon && <span className={classNames(styles.icon, iconClassName)}>{icon}</span>}
    {children}
  </li>
);

export default DropdownItem;
