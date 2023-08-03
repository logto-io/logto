import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import { useRef, type ReactNode } from 'react';
import type { To } from 'react-router-dom';
import { Link } from 'react-router-dom';

import { Tooltip } from '@/ds-components/Tip';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import useTextOverflow from '@/hooks/use-text-overflow';

import * as styles from './index.module.scss';

type Props = {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  to?: To;
  size?: 'default' | 'compact';
  suffix?: ReactNode;
  toTarget?: HTMLAnchorElement['target'];
};

function ItemPreview({ title, subtitle, icon, to, size = 'default', suffix, toTarget }: Props) {
  const { getTo } = useTenantPathname();
  const linkRef = useRef<HTMLAnchorElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const { isTextOverflow: isLinkOverflow } = useTextOverflow(linkRef);
  const { isTextOverflow } = useTextOverflow(linkRef);

  return (
    <div className={classNames(styles.item, styles[size])}>
      {icon}
      <div className={styles.content}>
        <div className={styles.meta}>
          {to && (
            <Tooltip
              content={conditional(isLinkOverflow && title)}
              anchorClassName={styles.tooltipAnchor}
            >
              <Link
                ref={linkRef}
                className={styles.title}
                to={getTo(to)}
                target={toTarget}
                onClick={(event) => {
                  event.stopPropagation();
                }}
              >
                {title}
              </Link>
            </Tooltip>
          )}
          {!to && (
            <Tooltip
              content={conditional(isTextOverflow && title)}
              anchorClassName={styles.tooltipAnchor}
            >
              <div ref={titleRef} className={styles.title}>
                {title}
              </div>
            </Tooltip>
          )}
          {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
        </div>
        {suffix}
      </div>
    </div>
  );
}

export default ItemPreview;
