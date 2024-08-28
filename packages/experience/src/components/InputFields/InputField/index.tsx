import classNames from 'classnames';
import type { ForwardedRef, HTMLProps, ReactElement } from 'react';
import { forwardRef, cloneElement } from 'react';

import ErrorMessage from '@/components/ErrorMessage';

import * as styles from './index.module.scss';

export type Props = Omit<HTMLProps<HTMLInputElement>, 'prefix'> & {
  readonly className?: string;
  readonly errorMessage?: string;
  readonly isDanger?: boolean;
  readonly prefix?: ReactElement;
  readonly suffix?: ReactElement;
  readonly isSuffixFocusVisible?: boolean;
};

const InputField = (
  { className, errorMessage, isDanger, prefix, suffix, isSuffixFocusVisible, ...props }: Props,
  reference: ForwardedRef<HTMLInputElement>
) => {
  const errorMessages = errorMessage?.split('\n');

  return (
    <div className={className}>
      <div
        className={classNames(
          styles.inputField,
          isDanger && styles.danger,
          isSuffixFocusVisible && styles.isSuffixFocusVisible
        )}
      >
        {prefix}
        <input {...props} ref={reference} />
        {suffix &&
          cloneElement(suffix, {
            className: classNames([suffix.props.className, styles.suffix]),
          })}
      </div>
      {errorMessages && (
        <ErrorMessage className={styles.errorMessage}>
          {errorMessages.length > 1 ? (
            <ul>
              {errorMessages.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          ) : (
            errorMessages[0]
          )}
        </ErrorMessage>
      )}
    </div>
  );
};
export default forwardRef(InputField);
