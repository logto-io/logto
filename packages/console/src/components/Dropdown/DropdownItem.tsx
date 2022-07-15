import classNames from 'classnames';
import { MouseEvent } from 'react';

import * as styles from './DropdownItem.module.scss';

type Props = {
  onClick?: (event: MouseEvent<HTMLLIElement>) => void;
  className?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
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
  <li className={classNames(styles.item, styles[type], className)} onClick={onClick}>
    {icon && <span className={classNames(styles.icon, iconClassName)}>{icon}</span>}
    {children}
  </li>
);

export default DropdownItem;
