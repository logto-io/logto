import React, { ReactNode } from 'react';

import * as styles from './index.module.scss';

type Props = {
  children: ReactNode;
};

const Content = ({ children }: Props) => {
  return <div className={styles.content}>{children}</div>;
};

export default Content;
