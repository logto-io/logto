import { nanoid } from 'nanoid';
import React, { InputHTMLAttributes, ReactNode, useState } from 'react';

import Icon from './Icon';
import * as styles from './index.module.scss';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: ReactNode;
};

const Checkbox = ({ label, disabled, ...rest }: Props) => {
  const [id] = useState(nanoid());

  return (
    <div className={styles.checkbox}>
      <input id={id} type="checkbox" disabled={disabled} {...rest} />
      <Icon className={styles.icon} />
      {label && <label htmlFor={id}>{label}</label>}
    </div>
  );
};

export default Checkbox;
