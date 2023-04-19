import type { HTMLProps, ReactNode, Ref } from 'react';
import { forwardRef } from 'react';

import * as styles from './index.module.scss';

type Props = Omit<HTMLProps<HTMLInputElement>, 'value'> & {
  label?: ReactNode;
};

function Switch({ label, checked = false, ...rest }: Props, ref?: Ref<HTMLInputElement>) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.label}>{label}</div>
      <label className={styles.switch}>
        <input type="checkbox" checked={checked} {...rest} ref={ref} />
        <span className={styles.slider} />
      </label>
    </div>
  );
}

export default forwardRef<HTMLInputElement, Props>(Switch);
