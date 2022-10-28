import type { ReactNode } from 'react';

import * as styles from './index.module.scss';
import type { Mutation } from './types';

type Props = {
  children: ReactNode;
  mutation: Mutation;
};

const DiffSegment = ({ children, mutation }: Props) => {
  if (mutation === 'none') {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
  }

  return <span className={mutation === 'added' ? styles.green : styles.red}>{children}</span>;
};

export default DiffSegment;
