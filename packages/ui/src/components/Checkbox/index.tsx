import type { InputHTMLAttributes, Ref } from 'react';
import { forwardRef } from 'react';

import CheckBox from '@/assets/icons/checkbox-icon.svg';

import * as styles from './index.module.scss';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

const Checkbox = ({ disabled, ...rest }: Props, ref: Ref<HTMLInputElement>) => {
  return (
    <div className={styles.checkbox}>
      <input type="checkbox" disabled={disabled} {...rest} ref={ref} readOnly />
      <CheckBox className={styles.icon} />
    </div>
  );
};

export default forwardRef<HTMLInputElement, Props>(Checkbox);
