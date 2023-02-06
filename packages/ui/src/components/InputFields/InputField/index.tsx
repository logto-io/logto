import classNames from 'classnames';
import type { ForwardedRef, HTMLProps, ReactElement } from 'react';
import { forwardRef, cloneElement } from 'react';

import type { ErrorType } from '@/components/ErrorMessage';
import ErrorMessage from '@/components/ErrorMessage';

import * as styles from './index.module.scss';

export type Props = Omit<HTMLProps<HTMLInputElement>, 'prefix'> & {
  className?: string;
  error?: ErrorType;
  isDanger?: boolean;
  prefix?: ReactElement;
  isPrefixVisible?: boolean;
  suffix?: ReactElement;
  isSuffixVisible?: boolean;
  isSuffixFocusVisible?: boolean;
};

const InputField = (
  {
    className,
    error,
    isDanger,
    prefix,
    suffix,
    isPrefixVisible,
    isSuffixFocusVisible,
    isSuffixVisible,
    ...props
  }: Props,
  reference: ForwardedRef<HTMLInputElement>
) => (
  <div className={className}>
    <div
      className={classNames(
        styles.inputField,
        isDanger && styles.danger,
        isPrefixVisible && styles.isPrefixVisible,
        isSuffixFocusVisible && styles.isSuffixFocusVisible,
        isSuffixVisible && styles.isSuffixVisible
      )}
    >
      {prefix}
      <input {...props} ref={reference} />
      {suffix &&
        cloneElement(suffix, {
          className: classNames([suffix.props.className, styles.suffix]),
        })}
    </div>
    {error && <ErrorMessage error={error} className={styles.errorMessage} />}
  </div>
);

export default forwardRef(InputField);
