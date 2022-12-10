import classNames from 'classnames';
import { nanoid } from 'nanoid';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { Tooltip } from '../Tip';
import Icon from './Icon';
import * as styles from './index.module.scss';

type Props = {
  // eslint-disable-next-line react/boolean-prop-naming
  value: boolean;
  onChange: (value: boolean) => void;
  label?: ReactNode;
  // eslint-disable-next-line react/boolean-prop-naming
  disabled: boolean;
  className?: string;
  disabledTooltip?: ReactNode;
};

const Checkbox = ({ value, onChange, label, disabled, className, disabledTooltip }: Props) => {
  const [id, setId] = useState(nanoid());

  return (
    <div className={classNames(styles.checkbox, className)}>
      <input
        id={id}
        type="checkbox"
        checked={value}
        disabled={disabled}
        onChange={(event) => {
          onChange(event.target.checked);
        }}
      />
      {disabled && disabledTooltip && (
        <Tooltip
          horizontalAlign="start"
          anchorClassName={styles.disabledMask}
          content={disabledTooltip}
        />
      )}
      <Icon className={styles.icon} />
      {label && <label htmlFor={id}>{label}</label>}
    </div>
  );
};

export default Checkbox;
