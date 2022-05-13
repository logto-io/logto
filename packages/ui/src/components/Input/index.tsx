import classNames from 'classnames';
import React, { useState, HTMLProps } from 'react';

import ErrorMessage, { ErrorType } from '@/components/ErrorMessage';
import { ClearIcon } from '@/components/Icons';

import * as styles from './index.module.scss';

export type Props = HTMLProps<HTMLInputElement> & {
  className?: string;
  error?: ErrorType;
  onClear?: () => void;
  errorStyling?: boolean;
};

const Input = ({
  className,
  type = 'text',
  value,
  error,
  errorStyling = true,
  onFocus,
  onBlur,
  onClear,
  ...rest
}: Props) => {
  const [onInputFocus, setOnInputFocus] = useState(false);

  return (
    <div className={className}>
      <div className={classNames(styles.wrapper, error && errorStyling && styles.error)}>
        <input
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
        {value && onInputFocus && onClear && (
          <ClearIcon
            className={styles.actionButton}
            onMouseDown={(event) => {
              event.preventDefault();
              onClear();
            }}
          />
        )}
      </div>
      {error && <ErrorMessage error={error} className={styles.errorMessage} />}
    </div>
  );
};

export default Input;
