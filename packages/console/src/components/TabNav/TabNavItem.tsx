import classNames from 'classnames';
import { Link, useLocation } from 'react-router-dom';

import { onKeyDownHandler } from '@/utilities/a11y';

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
      {href ? (
        <Link to={href}>{children}</Link>
      ) : (
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        <a role="tab" tabIndex={0} onKeyDown={onKeyDownHandler(onClick)} onClick={onClick}>
          {children}
        </a>
      )}
    </div>
  );
};

export default TabNavItem;
