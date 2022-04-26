import { nanoid } from 'nanoid';
import React, { forwardRef, InputHTMLAttributes, ReactNode, Ref, useState } from 'react';

import Icon from './Icon';
import * as styles from './index.module.scss';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: ReactNode;
};

const Checkbox = ({ label, disabled, ...rest }: Props, ref: Ref<HTMLInputElement>) => {
  const [id] = useState(nanoid());

  return (
    <div className={styles.checkbox}>
      <input id={id} type="checkbox" disabled={disabled} {...rest} ref={ref} />
      <Icon className={styles.icon} />
      {label && <label htmlFor={id}>{label}</label>}
    </div>
  );
};

export default forwardRef<HTMLInputElement, Props>(Checkbox);
