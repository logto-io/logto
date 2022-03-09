import classNames from 'classnames';
import React, { useState, useRef, useEffect } from 'react';

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
  const inputReference = useRef<HTMLInputElement>(null);

  // Used to toggle the password visibility
  const [type, setType] = useState('password');

  // Should refocus after the input type toggling
  useEffect(() => {
    if (!inputReference.current) {
      return;
    }

    inputReference.current.focus();
    inputReference.current.setSelectionRange(value.length, value.length);
  }, [type, value]);

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
        onChange={({ target: { value } }) => {
          onChange(value);
        }}
      />
      {value && (
        <PrivacyIcon
          className={classNames(styles.actionButton, type === 'password' && styles.highlight)}
          type={type === 'password' ? 'show' : 'hide'}
          onClick={() => {
            setType(type === 'password' ? 'text' : 'password');
          }}
        />
      )}
    </div>
  );
};

export default PasswordInput;
