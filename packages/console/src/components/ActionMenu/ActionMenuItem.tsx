import classNames from 'classnames';
import React from 'react';

import * as styles from './ActionMenuItem.module.scss';

type Props = {
  onClick?: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  type?: 'default' | 'danger';
};

const ActionMenuItem = ({ onClick, children, icon, type = 'default' }: Props) => (
  <li
    className={classNames(styles.item, styles[type])}
    onClick={() => {
      onClick?.();
    }}
  >
    {icon && <span className={styles.icon}>{icon}</span>}
    {children}
  </li>
);

export default ActionMenuItem;
