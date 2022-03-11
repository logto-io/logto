import classNames from 'classnames';
import React, { useState } from 'react';

import { PrivacyIcon } from '../Icons';
import * as styles from './index.module.scss';

export type Props = {
  name: string;
  autoComplete?: AutoCompleteType;
  isDisabled?: boolean;
  className?: string;
  placeholder?: string;
  value: string;
  hasError?: boolean;
  onChange: (value: string) => void;
};

const PasswordInput = ({
  name,
  autoComplete,
  isDisabled,
  className,
  placeholder,
  value,
  hasError = false,
  onChange,
}: Props) => {
  // Toggle the password visibility
  const [type, setType] = useState('password');
  const [onFocus, setOnFocus] = useState(false);
  const iconType = type === 'password' ? 'hide' : 'show';

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
        <PrivacyIcon
          className={classNames(styles.actionButton, iconType === 'hide' && styles.highlight)}
          type={iconType}
          onMouseDown={(event) => {
            event.preventDefault();
            setType(type === 'password' ? 'text' : 'password');
          }}
        />
      )}
    </div>
  );
};

export default PasswordInput;
