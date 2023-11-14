import classNames from 'classnames';
import { type PropsWithChildren } from 'react';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  /* The title of the panel, displayed in header */
  label: string;
  variant?: 'blue' | 'purple';
  size?: 'medium' | 'small';
};

function Panel({ className, label, variant, size = 'medium', children }: PropsWithChildren<Props>) {
  return (
    <div className={classNames(styles.panel, variant && styles[variant], styles[size], className)}>
      <div className={styles.header}>{label}</div>
      <div className={styles.body}>{children}</div>
    </div>
  );
}

export default Panel;
