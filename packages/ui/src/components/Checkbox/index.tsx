import type { InputHTMLAttributes, Ref } from 'react';
import { forwardRef } from 'react';

import CheckBox from '@/assets/icons/checkbox-icon.svg';
import RadioButton from '@/assets/icons/radio-button-icon.svg';
import usePlatform from '@/hooks/use-platform';

import * as styles from './index.module.scss';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

const Checkbox = ({ disabled, ...rest }: Props, ref: Ref<HTMLInputElement>) => {
  const { isMobile } = usePlatform();
  const Icon = isMobile ? RadioButton : CheckBox;

  return (
    <div className={styles.checkbox}>
      <input type="checkbox" disabled={disabled} {...rest} ref={ref} readOnly />
      <Icon className={styles.icon} />
    </div>
  );
};

export default forwardRef<HTMLInputElement, Props>(Checkbox);
