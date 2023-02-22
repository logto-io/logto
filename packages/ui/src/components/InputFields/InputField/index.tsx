import classNames from 'classnames';
import type { ForwardedRef, HTMLProps, ReactElement } from 'react';
import { forwardRef, cloneElement } from 'react';

import ErrorMessage from '@/components/ErrorMessage';

import * as styles from './index.module.scss';

export type Props = Omit<HTMLProps<HTMLInputElement>, 'prefix'> & {
  className?: string;
  errorMessage?: string;
  isDanger?: boolean;
  prefix?: ReactElement;
  suffix?: ReactElement;
  isSuffixVisible?: boolean;
  isSuffixFocusVisible?: boolean;
};

const InputField = (
  {
    className,
    errorMessage,
    isDanger,
    prefix,
    suffix,
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
    {errorMessage && <ErrorMessage className={styles.errorMessage}>{errorMessage}</ErrorMessage>}
  </div>
);

export default forwardRef(InputField);
