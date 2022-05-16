import React, { forwardRef, InputHTMLAttributes, Ref } from 'react';
import { isMobile } from 'react-device-detect';

import CheckBox from '@/assets/icons/checkbox-icon.svg';
import RadioButton from '@/assets/icons/radio-button-icon.svg';

import * as styles from './index.module.scss';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

const Checkbox = ({ disabled, ...rest }: Props, ref: Ref<HTMLInputElement>) => {
  const Icon = isMobile ? RadioButton : CheckBox;

  return (
    <div className={styles.checkbox}>
      <input type="checkbox" disabled={disabled} {...rest} ref={ref} readOnly />
      <Icon className={styles.icon} />
    </div>
  );
};

export default forwardRef<HTMLInputElement, Props>(Checkbox);
