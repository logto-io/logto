import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';

import ProfileIcon from '@ac/assets/icons/profile.svg?react';
import ShieldIcon from '@ac/assets/icons/shield.svg?react';
import { layoutClassNames } from '@ac/constants/layout';
import { profileRoute, securityRoute } from '@ac/constants/routes';

import styles from './index.module.scss';

type SidebarItem = {
  to: string;
  labelKey: 'account_center.page.sidebar_personal_info' | 'account_center.page.sidebar_security';
  Icon: SvgComponent;
};

type Props = {
  readonly hasProfile: boolean;
  readonly hasSecurity: boolean;
};

const Sidebar = ({ hasProfile, hasSecurity }: Props) => {
  const { t } = useTranslation();

  const items: SidebarItem[] = [
    ...(hasProfile
      ? [
          {
            to: profileRoute,
            labelKey: 'account_center.page.sidebar_personal_info' as const,
            Icon: ProfileIcon,
          },
        ]
      : []),
    ...(hasSecurity
      ? [
          {
            to: securityRoute,
            labelKey: 'account_center.page.sidebar_security' as const,
            Icon: ShieldIcon,
          },
        ]
      : []),
  ];

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
