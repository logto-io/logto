import React, { forwardRef, InputHTMLAttributes, Ref } from 'react';

import { CheckBoxIcon } from '../Icons';
import * as styles from './index.module.scss';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

const Checkbox = ({ disabled, ...rest }: Props, ref: Ref<HTMLInputElement>) => {
  return (
    <div className={styles.checkbox}>
      <input type="checkbox" disabled={disabled} {...rest} ref={ref} readOnly />
      <CheckBoxIcon className={styles.icon} />
    </div>
  );
};

export default forwardRef<HTMLInputElement, Props>(Checkbox);
