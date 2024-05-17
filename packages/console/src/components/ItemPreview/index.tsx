import classNames from 'classnames';
import type { ReactNode } from 'react';
import type { To } from 'react-router-dom';
import { Link } from 'react-router-dom';

import useTenantPathname from '@/hooks/use-tenant-pathname';

import * as styles from './index.module.scss';

type Props = {
  readonly title: ReactNode;
  readonly subtitle?: ReactNode;
  readonly icon?: ReactNode;
  readonly to?: To;
  readonly size?: 'default' | 'compact';
  readonly suffix?: ReactNode;
  readonly toTarget?: HTMLAnchorElement['target'];
};

function ItemPreview({ title, subtitle, icon, to, size = 'default', suffix, toTarget }: Props) {
  const { getTo } = useTenantPathname();

  return (
    <div className={classNames(styles.item, styles[size])}>
      {icon}
      <div className={styles.content}>
        <div className={styles.meta}>
          {to && (
            <Link
              className={classNames(styles.title, styles.withLink)}
              to={getTo(to)}
              target={toTarget}
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
        {suffix}
      </div>
    </div>
  );
}

export default ItemPreview;
