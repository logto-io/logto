import classNames from 'classnames';
import { ReactNode } from 'react';

import * as styles from './index.module.scss';

type Props = {
  status: 'enabled' | 'disabled';
  children: ReactNode;
  variant?: 'plain' | 'outlined';
};

const Status = ({ status, children, variant = 'plain' }: Props) => (
  <div className={classNames(styles.status, styles[status], styles[variant])}>
    <div className={styles.icon} />
    <div>{children}</div>
  </div>
);

export default Status;
