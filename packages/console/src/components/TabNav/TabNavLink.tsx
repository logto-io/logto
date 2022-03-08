import classNames from 'classnames';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import * as styles from './TabNavLink.module.scss';

type Props = {
  href: string;
  children: React.ReactNode;
};

const TabNavLink = ({ children, href }: Props) => {
  const location = useLocation();
  const selected = location.pathname === href;

  return (
    <div className={classNames(styles.link, selected && styles.selected)}>
      <Link to={href}>{children}</Link>
    </div>
  );
};

export default TabNavLink;
