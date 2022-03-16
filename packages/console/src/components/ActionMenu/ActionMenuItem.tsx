import React from 'react';

import * as styles from './ActionMenuItem.module.scss';

type Props = {
  onClick?: () => void;
  children: React.ReactNode;
};

const ActionMenuItem = ({ onClick, children }: Props) => (
  <li
    className={styles.item}
    onClick={() => {
      onClick?.();
    }}
  >
    {children}
  </li>
);

export default ActionMenuItem;
