import React from 'react';

import * as styles from './index.module.scss';

export { default as TabNavLink } from './TabNavLink';

type Props = {
  children: React.ReactNode;
};

const TabNav = ({ children }: Props) => <nav className={styles.nav}>{children}</nav>;

export default TabNav;
