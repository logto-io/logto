import classNames from 'classnames';
import type { ForwardedRef, HTMLProps, ReactElement } from 'react';
import { forwardRef, cloneElement } from 'react';

import type { ErrorType } from '@/components/ErrorMessage';
import ErrorMessage from '@/components/ErrorMessage';

import * as styles from './index.module.scss';

type Props = HTMLProps<HTMLInputElement> & {
  className?: string;
  error?: ErrorType;
  isDanger?: boolean;
  suffix?: ReactElement;
  isSuffixFocusVisible?: boolean;
  isSuffixVisible?: boolean;
};

const InputField = (
  { className, error, isDanger, suffix, isSuffixFocusVisible, isSuffixVisible, ...props }: Props,
  reference: ForwardedRef<HTMLInputElement>
) => (
  <div className={className}>
    <div className={classNames(styles.inputField, isDanger && styles.danger)}>
      <input {...props} ref={reference} />
      {suffix &&
        cloneElement(suffix, {
          className: classNames([
            suffix.props.className,
            styles.suffix,
            isSuffixFocusVisible && styles.focusVisible,
            isSuffixVisible && styles.visible,
          ]),
        })}
    </div>
    {error && <ErrorMessage error={error} className={styles.errorMessage} />}
  </div>
);

export default forwardRef(InputField);
