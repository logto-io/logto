import React, { ReactNode } from 'react';

import * as styles from './index.module.scss';

type Props = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
};

const ItemPreview = ({ title, subtitle, icon }: Props) => {
  return (
    <div className={styles.item}>
      {icon}
      <div>
        <div className={styles.title}>{title}</div>
        {subtitle && <div className={styles.subtitle}>{String(subtitle)}</div>}
      </div>
    </div>
  );
};

export default ItemPreview;
