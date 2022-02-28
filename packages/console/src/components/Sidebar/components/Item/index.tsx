import React, { ReactChild } from 'react';

import * as styles from './index.module.scss';

type Props = {
  icon?: ReactChild;
  title: string;
};

const Item = ({ icon, title }: Props) => {
  return (
    <div className={styles.row}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <div className={styles.title}>{title}</div>
    </div>
  );
};

export default Item;
