import classNames from 'classnames';
import { type PropsWithChildren } from 'react';

import styles from './index.module.scss';

type Props = {
  readonly className?: string;
  /* The title of the panel, displayed in header */
  readonly label: string;
  readonly variant?: 'blue' | 'purple';
  readonly size?: 'medium' | 'small';
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
