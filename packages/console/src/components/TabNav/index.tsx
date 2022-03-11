import classNames from 'classnames';
import React from 'react';

import * as styles from './index.module.scss';

export { default as TabNavLink } from './TabNavLink';

type Props = {
  className?: string;
  children: React.ReactNode;
};

const TabNav = ({ className, children }: Props) => (
  <nav className={classNames(styles.nav, className)}>{children}</nav>
);

export default TabNav;
