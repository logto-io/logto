import classNames from 'classnames';
import React, { forwardRef, HTMLProps, ForwardedRef } from 'react';

import ClearIcon from '@/icons/ClearIcon';

import * as styles from './index.module.scss';

type Props = HTMLProps<HTMLInputElement> & {
  error?: string;
  className?: string;
  showClearButton?: boolean;
  onClear?: () => void;
  errorStyling?: boolean;
};

const Input = (
  {
    className,
    errorStyling = true,
    showClearButton = false,
    error,
    value,
    onClear,
    ...rest
  }: Props,
  reference: ForwardedRef<HTMLInputElement>
) => {
  return (
    <div className={className}>
      <div className={classNames(styles.container, error && errorStyling && styles.error)}>
        <input {...rest} ref={reference} />
        {showClearButton && onClear && (
          <ClearIcon
            className={styles.actionButton}
            onMouseDown={(event) => {
              event.preventDefault();
              onClear();
            }}
          />
        )}
      </div>
      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
};

export default forwardRef(Input);
