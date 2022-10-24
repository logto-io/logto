import { nanoid } from 'nanoid';
import type { ReactNode } from 'react';
import { useState } from 'react';

import Icon from './Icon';
import * as styles from './index.module.scss';

type Props = {
  // eslint-disable-next-line react/boolean-prop-naming
  value: boolean;
  onChange: (value: boolean) => void;
  label?: ReactNode;
  // eslint-disable-next-line react/boolean-prop-naming
  disabled: boolean;
};

const Checkbox = ({ value, onChange, label, disabled }: Props) => {
  const [id, setId] = useState(nanoid());

  return (
    <div className={styles.checkbox}>
      <input
        id={id}
        type="checkbox"
        checked={value}
        disabled={disabled}
        onChange={(event) => {
          onChange(event.target.checked);
        }}
      />
      <Icon className={styles.icon} />
      {label && <label htmlFor={id}>{label}</label>}
    </div>
  );
};

export default Checkbox;
