import type { ReactNode } from 'react';

import * as styles from './index.module.scss';

type Props = {
  children: ReactNode;
  hasChanged: boolean;
  isAfter?: boolean;
};

function DiffSegment({ children, hasChanged, isAfter = false }: Props) {
  if (!hasChanged) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
  }

  return <span className={isAfter ? styles.green : styles.red}>{children}</span>;
}

export default DiffSegment;
