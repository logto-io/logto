import classNames from 'classnames';
import React, { ReactNode } from 'react';

import styles from './index.module.scss';

type Props = {
  status: 'operational' | 'offline';
  children: ReactNode;
};

const Status = ({ status, children }: Props) => (
  <div className={classNames(styles.status, styles[status])}>
    <div className={styles.icon} />
    <div>{children}</div>
  </div>
);

export default Status;
