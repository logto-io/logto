import type { ReactNode } from 'react';

import * as styles from './index.module.scss';

type Props = {
  children: ReactNode;
};

const ActionBar = ({ children }: Props) => <div className={styles.container}>{children}</div>;

export default ActionBar;
