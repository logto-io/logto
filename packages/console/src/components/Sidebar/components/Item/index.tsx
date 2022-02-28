import classNames from 'classnames';
import React, { ReactChild } from 'react';

import * as styles from './index.module.scss';

type Props = {
  icon?: ReactChild;
  title: string;
  isActive?: boolean;
};

const Item = ({ icon, title, isActive = false }: Props) => {
  return (
    <div className={classNames(styles.row, isActive && styles.active)}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <div className={styles.title}>{title}</div>
    </div>
  );
};

export default Item;
