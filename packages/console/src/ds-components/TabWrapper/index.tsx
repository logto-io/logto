import classNames from 'classnames';
import type { ReactNode } from 'react';

import * as styles from './index.module.scss';

type Props = {
  isActive: boolean;
  className?: string;
  children: ReactNode;
};

function TabWrapper({ isActive, className, children }: Props) {
  return <div className={classNames(!isActive && styles.hide, className)}>{children}</div>;
}

export default TabWrapper;
