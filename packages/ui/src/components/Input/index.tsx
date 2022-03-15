import classNames from 'classnames';
import React, { useState } from 'react';

import { ClearIcon } from '../Icons';
import * as styles from './index.module.scss';

type SupportedInputType = 'text' | 'email';

export type Props = {
  name: string;
  autoComplete?: AutoCompleteType;
  isDisabled?: boolean;
  className?: string;
  placeholder?: string;
  type?: SupportedInputType;
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
  const [onFocus, setOnFocus] = useState(false);

  return (
    <div
      className={classNames(
        styles.wrapper,
        onFocus && styles.focus,
        hasError && styles.error,
        className
      )}
    >
      <input
        name={name}
        disabled={isDisabled}
        placeholder={placeholder}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onFocus={() => {
          setOnFocus(true);
        }}
        onBlur={() => {
          setOnFocus(false);
        }}
        onChange={({ target: { value } }) => {
          onChange(value);
        }}
      />
      {value && onFocus && (
        <ClearIcon
          className={styles.actionButton}
          onMouseDown={(event) => {
            event.preventDefault();
            onChange('');
          }}
        />
      )}
    </div>
  );
};

export default Input;
