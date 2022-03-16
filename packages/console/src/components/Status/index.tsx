import classNames from 'classnames';
import React, { ReactNode } from 'react';

import * as styles from './index.module.scss';

type Props = {
  status: 'enabled' | 'disabled';
  children: ReactNode;
};

const Status = ({ status, children }: Props) => (
  <div className={classNames(styles.status, styles[status])}>
    <div className={styles.icon} />
    <div>{children}</div>
  </div>
);

export default Status;
