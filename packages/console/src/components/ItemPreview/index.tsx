import React, { ReactNode } from 'react';
import { Link, To } from 'react-router-dom';

import * as styles from './index.module.scss';

type Props = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  to?: To;
};

const ItemPreview = ({ title, subtitle, icon, to }: Props) => {
  return (
    <div className={styles.item}>
      {icon}
      <div>
        {to && (
          <Link
            className={styles.title}
            to={to}
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            {title}
          </Link>
        )}
        {!to && <div className={styles.title}>{title}</div>}
        {subtitle && <div className={styles.subtitle}>{String(subtitle)}</div>}
      </div>
    </div>
  );
};

export default ItemPreview;
