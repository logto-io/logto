import classNames from 'classnames';
import React, { ReactNode } from 'react';
import { Link, To } from 'react-router-dom';

import * as styles from './index.module.scss';

type Props = {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  to?: To;
  locationState?: any;
  size?: 'default' | 'compact';
};

const ItemPreview = ({ title, subtitle, icon, to, locationState, size = 'default' }: Props) => {
  return (
    <div className={classNames(styles.item, styles[size])}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <div className={styles.content}>
        {to && (
          <Link
            className={styles.title}
            to={to}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            state={locationState}
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            {title}
          </Link>
        )}
        {!to && <div className={styles.title}>{title}</div>}
        {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
      </div>
    </div>
  );
};

export default ItemPreview;
