import classNames from 'classnames';
import React, { forwardRef, HTMLProps, ReactNode } from 'react';

import * as styles from './index.module.scss';

// https://github.com/yannickcr/eslint-plugin-react/issues/2856
/* eslint-disable react/require-default-props */
type Props = HTMLProps<HTMLInputElement> & {
  hasError?: boolean;
  icon?: ReactNode;
  disabled?: boolean;
  readOnly?: boolean;
};
/* eslint-enable react/require-default-props */

const TextInput = forwardRef<HTMLInputElement, Props>(
  ({ hasError = false, icon, disabled, readOnly, ...rest }, reference) => {
    return (
      <div
        className={classNames(
          styles.container,
          hasError && styles.error,
          icon && styles.withIcon,
          disabled && styles.disabled,
          readOnly && styles.readOnly
        )}
      >
        {icon && <span className={styles.icon}>{icon}</span>}
        <input type="text" {...rest} ref={reference} disabled={disabled} readOnly={readOnly} />
      </div>
    );
  }
);

export default TextInput;
