import type { ReactNode } from 'react';

import * as styles from './index.module.scss';

type Props = {
  title: string;
  children: ReactNode;
};

const Section = ({ children, title }: Props) => {
  return (
    <div>
      <div className={styles.title}>{title}</div>
      {children}
    </div>
  );
};

export default Section;
