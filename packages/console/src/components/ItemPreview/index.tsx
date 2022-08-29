import classNames from 'classnames';
import { ReactNode } from 'react';
import { Link, To } from 'react-router-dom';

import * as styles from './index.module.scss';

type Props = {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  to?: To;
  size?: 'default' | 'compact';
};

const ItemPreview = ({ title, subtitle, icon, to, size = 'default' }: Props) => {
  return (
    <div className={classNames(styles.item, styles[size])}>
      {icon}
      <div className={styles.content}>
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
        {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
      </div>
    </div>
  );
};

export default ItemPreview;
