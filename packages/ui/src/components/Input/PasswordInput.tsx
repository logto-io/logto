import classNames from 'classnames';
import React, { useState, useRef, HTMLProps } from 'react';

import ErrorMessage, { ErrorType } from '@/components/ErrorMessage';
import { PrivacyIcon } from '@/components/Icons';

import * as styles from './index.module.scss';

export type Props = Omit<HTMLProps<HTMLInputElement>, 'type'> & {
  className?: string;
  error?: ErrorType;
};

const PasswordInput = ({ className, value, error, onFocus, onBlur, ...rest }: Props) => {
  // Toggle the password visibility
  const [type, setType] = useState('password');
  const [onInputFocus, setOnInputFocus] = useState(false);
  const inputElement = useRef<HTMLInputElement>(null);
  const iconType = type === 'password' ? 'hide' : 'show';

  return (
    <div className={className}>
      <div
        className={classNames(styles.wrapper, onInputFocus && styles.focus, error && styles.error)}
      >
        <input
          ref={inputElement}
          type={type}
          value={value}
          onFocus={(event) => {
            setOnInputFocus(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setOnInputFocus(false);
            onBlur?.(event);
          }}
          {...rest}
        />
        {value && onInputFocus && (
          <PrivacyIcon
            className={styles.actionButton}
            type={iconType}
            onMouseDown={(event) => {
              event.preventDefault();
              setType(type === 'password' ? 'text' : 'password');

              if (inputElement.current) {
                const { length } = inputElement.current.value;
                // Force async render, move cursor to the end of the input
                setTimeout(() => {
                  inputElement.current?.setSelectionRange(length, length);
                });
              }
            }}
          />
        )}
      </div>
      {error && <ErrorMessage className={styles.errorMessage} error={error} />}
    </div>
  );
};

export default PasswordInput;
