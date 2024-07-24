import type { ReactNode } from 'react';

import styles from './index.module.scss';

type Props = {
  readonly title: string;
  readonly children: ReactNode;
};

function Section({ children, title }: Props) {
  return (
    <div>
      <div className={styles.title}>{title}</div>
      {children}
    </div>
  );
}

export default Section;
