import classNames from 'classnames';
import type { InputHTMLAttributes, Ref } from 'react';
import { forwardRef } from 'react';

import CheckBox from '@/assets/icons/checkbox-icon.svg';

import * as styles from './index.module.scss';

type Props = {
  readonly size?: 'small' | 'default';
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'>;

const Checkbox = ({ disabled, size = 'default', ...rest }: Props, ref: Ref<HTMLInputElement>) => {
  return (
    <div className={styles.checkbox}>
      <input type="checkbox" disabled={disabled} {...rest} ref={ref} readOnly />
      <CheckBox className={classNames(styles.icon, size === 'small' && styles.small)} />
    </div>
  );
};

export default forwardRef<HTMLInputElement, Props>(Checkbox);
