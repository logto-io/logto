import classNames from 'classnames';
import type { ReactNode } from 'react';

import styles from './index.module.scss';

export type Props = {
  readonly isActive: boolean;
  readonly className?: string;
  readonly children: ReactNode;
};

function TabWrapper({ isActive, className, children }: Props) {
  return (
    <div className={classNames(!isActive && styles.hide, className)} data-active={isActive}>
      {children}
    </div>
  );
}

export default TabWrapper;
