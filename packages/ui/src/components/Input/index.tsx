import classNames from 'classnames';
import React, { useState, useRef } from 'react';

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
  const inputReference = useRef<HTMLInputElement>(null);

  return (
    <div className={classNames(styles.wrapper, className)}>
      <input
        ref={inputReference}
        name={name}
        disabled={isDisabled}
        className={classNames(styles.input, hasError && styles.error)}
        placeholder={placeholder}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onFocus={() => {
          setOnFocus(true);
        }}
        onBlur={() => {
          console.log('blur');
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
            // Should execute before onFocus
            event.preventDefault();
            onChange('');
          }}
        />
      )}
    </div>
  );
};

export default Input;
