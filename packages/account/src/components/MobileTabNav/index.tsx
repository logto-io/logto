import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';

import { layoutClassNames } from '@ac/constants/layout';

import { buildAccountNavItems } from '../account-nav-items';

import styles from './index.module.scss';

type Props = {
  readonly hasProfile: boolean;
  readonly hasSecurity: boolean;
};

const MobileTabNav = ({ hasProfile, hasSecurity }: Props) => {
  const { t } = useTranslation();
  const items = buildAccountNavItems({ hasProfile, hasSecurity });

  if (items.length <= 1) {
    return null;
  }

  return (
    <nav className={classNames(styles.tabNav, layoutClassNames.mobileTabNav)}>
      {items.map(({ to, labelKey }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            classNames(styles.tab, isActive && styles.active, layoutClassNames.mobileTabNavItem)
          }
        >
          {t(labelKey)}
        </NavLink>
      ))}
    </nav>
  );
};

export default MobileTabNav;
