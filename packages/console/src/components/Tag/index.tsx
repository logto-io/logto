import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import type { ReactNode } from 'react';

import Failed from '@/assets/images/failed.svg';
import Success from '@/assets/images/success.svg';

import * as styles from './index.module.scss';

type Props = {
  type?: 'property' | 'state' | 'result';
  status?: 'info' | 'success' | 'alert' | 'error';
  variant?: 'plain' | 'outlined';
  className?: string;
  children: ReactNode;
};

const ResultIconMap: Partial<Record<Required<Props>['status'], SvgComponent>> = {
  success: Success,
  error: Failed,
};

function Tag({
  type = 'property',
  status = 'info',
  variant = 'outlined',
  className,
  children,
}: Props) {
  const ResultIcon = conditional(type === 'result' && ResultIconMap[status]);

  return (
    <div className={classNames(styles.tag, styles[status], styles[variant], className)}>
      {type === 'state' && <div className={styles.icon} />}
      {ResultIcon && <ResultIcon className={classNames(styles.icon, styles.resultIcon)} />}
      <div>{children}</div>
    </div>
  );
}

export default Tag;
