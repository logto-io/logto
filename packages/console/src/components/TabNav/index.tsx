import classNames from 'classnames';

import * as styles from './index.module.scss';

export { default as TabNavItem } from './TabNavItem';

type Props = {
  className?: string;
  children: React.ReactNode;
};

function TabNav({ className, children }: Props) {
  return <nav className={classNames(styles.nav, className)}>{children}</nav>;
}

export default TabNav;
