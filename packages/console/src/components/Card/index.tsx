import React, { ReactNode } from 'react';

import * as styles from './index.module.scss';

type Props = {
  children: ReactNode;
};

const Card = ({ children }: Props) => {
  return <div className={styles.card}>{children}</div>;
};

export default Card;
