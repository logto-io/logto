import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import useMatchTenantPath from '@/hooks/use-tenant-pathname';
import { onKeyDownHandler } from '@/utils/a11y';

import * as styles from './TabNavItem.module.scss';

type BaseProps = {
  isActive?: boolean;
  errorCount?: number;
  children: React.ReactNode;
};

type LinkStyleProps<Paths> = {
  href: Paths;
};

type TabStyleProps = {
  onClick: () => void;
};

type Props<Paths extends string> =
  | (BaseProps & LinkStyleProps<Paths> & Partial<Record<keyof TabStyleProps, never>>)
  | (BaseProps & TabStyleProps & Partial<Record<keyof LinkStyleProps<Paths>, never>>);

function TabNavItem<Paths extends string>({
  children,
  href,
  isActive,
  errorCount = 0,
  onClick,
}: Props<Paths>) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { match, getTo } = useMatchTenantPath();
  // `isActive` is used to override the default behavior of `match` when the
  // tab is not a link or the link is a relative path.
  const selected = isActive ?? (href ? match(href) : false);

  return (
    <div className={styles.item}>
      <div className={classNames(styles.link, selected && styles.selected)}>
        {href ? (
          <Link to={getTo(href)}>{children}</Link>
        ) : (
          // eslint-disable-next-line jsx-a11y/anchor-is-valid
          <a role="tab" tabIndex={0} onKeyDown={onKeyDownHandler(onClick)} onClick={onClick}>
            {children}
          </a>
        )}
      </div>
      {errorCount > 0 && (
        <div className={styles.errors}>{t('general.tab_errors', { count: errorCount })}</div>
      )}
    </div>
  );
}

export default TabNavItem;
