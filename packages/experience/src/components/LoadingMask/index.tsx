import { type ReactNode } from 'react';

import styles from './index.module.scss';

type Props = {
  readonly children?: ReactNode;
};

const LoadingMask = ({ children }: Props) => {
  return <div className={styles.overlay}>{children}</div>;
};

export default LoadingMask;
