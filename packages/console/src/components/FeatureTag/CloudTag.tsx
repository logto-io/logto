import classNames from 'classnames';
import type { ReactNode } from 'react';

import styles from './index.module.scss';

type Props = {
  readonly className?: string;
  readonly children: ReactNode;
};

function CloudTag({ className, children }: Props) {
  return <div className={classNames(styles.tag, styles.cloud, className)}>{children}</div>;
}

export default CloudTag;
