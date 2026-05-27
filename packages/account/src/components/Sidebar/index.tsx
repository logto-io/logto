import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';

import { layoutClassNames } from '@ac/constants/layout';

import type { AccountNavItem } from '../account-nav-items';

import styles from './index.module.scss';

type Props = {
  readonly items: readonly AccountNavItem[];
};

const Sidebar = ({ items }: Props) => {
  const { t } = useTranslation();

  if (items.length === 0) {
    return null;
  }

  return (
    <aside className={classNames(styles.sidebar, layoutClassNames.sidebar)}>
      <nav className={styles.nav}>
        {items.map(({ to, labelKey, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              classNames(styles.item, isActive && styles.active, layoutClassNames.sidebarItem)
            }
          >
            <Icon className={styles.icon} />
            <span>{t(labelKey)}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
