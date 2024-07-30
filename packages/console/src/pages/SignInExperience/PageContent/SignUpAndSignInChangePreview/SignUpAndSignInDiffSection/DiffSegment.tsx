import type { ReactNode } from 'react';

import styles from './index.module.scss';

type Props = {
  readonly children: ReactNode;
  readonly hasChanged: boolean;
  readonly isAfter?: boolean;
};

function DiffSegment({ children, hasChanged, isAfter = false }: Props) {
  if (!hasChanged) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
  }

  return <span className={isAfter ? styles.green : styles.red}>{children}</span>;
}

export default DiffSegment;
