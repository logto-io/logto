import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import type { HTMLProps, ReactNode } from 'react';

import Failed from '@/assets/icons/failed.svg';
import Success from '@/assets/icons/success.svg';

import * as styles from './index.module.scss';

export type Props = Pick<HTMLProps<HTMLDivElement>, 'className' | 'onClick'> & {
  readonly type?: 'property' | 'state' | 'result';
  readonly status?: 'info' | 'success' | 'alert' | 'error';
  readonly variant?: 'plain' | 'outlined' | 'cell';
  readonly size?: 'medium' | 'small';
  readonly children: ReactNode;
};

const ResultIconMap: Partial<Record<Required<Props>['status'], SvgComponent>> = {
  success: Success,
  error: Failed,
};

function Tag({
  type = 'property',
  status = 'info',
  variant = 'outlined',
  size = 'medium',
  className,
  children,
  ...rest
}: Props) {
  const ResultIcon = conditional(type === 'result' && ResultIconMap[status]);

  return (
    <div
      className={classNames(styles.tag, styles[status], styles[variant], styles[size], className)}
      {...rest}
    >
      {type === 'state' && <div className={styles.icon} />}
      {ResultIcon && <ResultIcon className={classNames(styles.icon, styles.resultIcon)} />}
      {children}
    </div>
  );
}

export default Tag;
