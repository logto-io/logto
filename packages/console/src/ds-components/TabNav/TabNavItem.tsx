import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

import { onKeyDownHandler } from '@/utils/a11y';

import * as styles from './TabNavItem.module.scss';

type BaseProps = {
  isActive?: boolean;
  errorCount?: number;
  children: React.ReactNode;
};

type LinkStyleProps = {
  href: string;
};

type TabStyleProps = {
  onClick: () => void;
};

type Props =
  | (BaseProps & LinkStyleProps & Partial<Record<keyof TabStyleProps, undefined>>)
  | (BaseProps & TabStyleProps & Partial<Record<keyof LinkStyleProps, undefined>>);

function TabNavItem({ children, href, isActive, errorCount = 0, onClick }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const location = useLocation();
  const selected = href ? location.pathname === href : isActive;

  return (
    <div className={styles.item}>
      <div className={classNames(styles.link, selected && styles.selected)}>
        {href ? (
          <Link to={href}>{children}</Link>
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
