import classNames from 'classnames';
import type { HTMLProps, ReactNode, Ref } from 'react';
import { forwardRef } from 'react';

import * as styles from './index.module.scss';

type Props = Omit<HTMLProps<HTMLInputElement>, 'label'> & {
  readonly label?: ReactNode;
  readonly hasError?: boolean;
};

function Switch({ label, hasError, ...rest }: Props, ref?: Ref<HTMLInputElement>) {
  return (
    <div className={classNames(styles.wrapper, hasError && styles.error)}>
      <div className={styles.label}>{label}</div>
      <label className={styles.switch}>
        <input type="checkbox" {...rest} ref={ref} />
        <span className={styles.slider} />
      </label>
    </div>
  );
}

export default forwardRef<HTMLInputElement, Props>(Switch);
