import classNames from 'classnames';
import React, { ReactNode } from 'react';

import * as styles from './index.module.scss';

type Props = {
  status: 'enabled' | 'disabled';
  children: ReactNode;
  varient?: 'plain' | 'outlined';
};

const Status = ({ status, children, varient = 'plain' }: Props) => (
  <div className={classNames(styles.status, styles[status], styles[varient])}>
    <div className={styles.icon} />
    <div>{children}</div>
  </div>
);

export default Status;
