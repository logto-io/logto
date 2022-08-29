import classNames from 'classnames';
import { Link, useLocation } from 'react-router-dom';

import * as styles from './TabNavItem.module.scss';

type Props = {
  href?: string;
  isActive?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
};

const TabNavItem = ({ children, href, isActive, onClick }: Props) => {
  const location = useLocation();
  const selected = href ? location.pathname === href : isActive;

  return (
    <div className={classNames(styles.link, selected && styles.selected)}>
      {href ? <Link to={href}>{children}</Link> : <a onClick={onClick}>{children}</a>}
    </div>
  );
};

export default TabNavItem;
