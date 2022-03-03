import classNames from 'classnames';
import React, { ReactChild } from 'react';
import { Link } from 'react-router-dom';

import { getPath } from '../../utils';
import * as styles from './index.module.scss';

type Props = {
  icon?: ReactChild;
  title: string;
  isActive?: boolean;
};

const Item = ({ icon, title, isActive = false }: Props) => {
  return (
    <Link to={getPath(title)} className={classNames(styles.row, isActive && styles.active)}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <div className={styles.title}>{title}</div>
    </Link>
  );
};

export default Item;
