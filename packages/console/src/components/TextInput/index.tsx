import classNames from 'classnames';
import type { HTMLProps, ForwardedRef, ReactElement } from 'react';
import { cloneElement, forwardRef } from 'react';

import * as styles from './index.module.scss';

type Props = Omit<HTMLProps<HTMLInputElement>, 'size'> & {
  hasError?: boolean;
  errorMessage?: string;
  icon?: ReactElement;
  suffix?: ReactElement;
};

const TextInput = (
  {
    errorMessage,
    hasError = Boolean(errorMessage),
    icon,
    suffix,
    disabled,
    className,
    readOnly,
    ...rest
  }: Props,
  reference: ForwardedRef<HTMLInputElement>
) => {
  return (
    <div className={className}>
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
        {suffix &&
          cloneElement(suffix, {
            className: classNames([suffix.props.className, styles.suffix]),
          })}
      </div>
      {hasError && errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
    </div>
  );
};

export default forwardRef(TextInput);
