import classNames from 'classnames';
import React from 'react';

import CloseIcon from '../Icons/CloseIcon';
import * as styles from './index.module.scss';

export type Props = {
  name: string;
  autoComplete?: AutoCompleteType;
  isDisabled?: boolean;
  className?: string;
  placeholder?: string;
  type?: InputType;
  value: string;
  hasError?: boolean;
  onChange: (value: string) => void;
};

const Input = ({
  name,
  autoComplete,
  isDisabled,
  className,
  placeholder,
  type = 'text',
  value,
  hasError = false,
  onChange,
}: Props) => {
  return (
    <div className={classNames(styles.wrapper, className)}>
      <input
        name={name}
        disabled={isDisabled}
        className={classNames(styles.input, hasError && styles.error)}
        placeholder={placeholder}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={({ target: { value } }) => {
          onChange(value);
        }}
      />
      {value && (
        <CloseIcon
          className={classNames(styles.clearBtn)}
          onClick={() => {
            onChange('');
          }}
        />
      )}
    </div>
  );
};

export default Input;
