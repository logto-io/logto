import { type Nullable } from '@silverhand/essentials';
import classNames from 'classnames';
import type { HTMLProps, ReactElement, Ref } from 'react';
import { forwardRef, cloneElement, useState, useImperativeHandle, useRef, useEffect } from 'react';

import ErrorMessage from '@/components/ErrorMessage';

import NotchedBorder from './NotchedBorder';
import * as styles from './index.module.scss';

export type Props = Omit<HTMLProps<HTMLInputElement>, 'prefix'> & {
  readonly className?: string;
  readonly inputFieldClassName?: string;
  readonly errorMessage?: string;
  readonly isDanger?: boolean;
  readonly prefix?: ReactElement;
  readonly isPrefixVisible?: boolean;
  readonly suffix?: ReactElement;
  readonly isSuffixFocusVisible?: boolean;
  readonly label?: string;
};

const InputField = (
  {
    className,
    inputFieldClassName,
    errorMessage,
    isDanger,
    prefix,
    suffix,
    isPrefixVisible,
    isSuffixFocusVisible,
    label,
    onFocus,
    onBlur,
    onChange,
    value,
    ...props
  }: Props,
  reference: Ref<Nullable<HTMLInputElement>>
) => {
  const innerRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(reference, () => innerRef.current);

  const errorMessages = errorMessage?.split('\n');

  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const hasContent =
    Boolean(isPrefixVisible) ||
    hasValue ||
    // Handle the case when this filed have a default value
    Boolean(value);

  const isActive = hasContent || isFocused;

  useEffect(() => {
    const inputDom = innerRef.current;
    if (!inputDom) {
      return;
    }

    /**
     * Use a timeout to check if the input field has autofill value.
     * Fix the issue that the input field doesn't have the active style when the autofill value is set.
     * see https://github.com/facebook/react/issues/1159#issuecomment-1025423604
     */
    const checkAutoFillTimeout = setTimeout(() => {
      setHasValue(inputDom.matches('*:-webkit-autofill'));
    }, 200);

    return () => {
      clearTimeout(checkAutoFillTimeout);
    };
  }, [innerRef]);

  return (
    <div className={className}>
      <div
        className={classNames(
          styles.container,
          isDanger && styles.danger,
          isActive && styles.active,
          isFocused && styles.focus,
          !label && styles.noLabel
        )}
      >
        <div
          className={classNames(
            styles.inputField,
            isSuffixFocusVisible && styles.isSuffixFocusVisible,
            inputFieldClassName
          )}
        >
          {prefix}
          <input
            {...props}
            ref={innerRef}
            value={value}
            onFocus={(event) => {
              setIsFocused(true);
              return onFocus?.(event);
            }}
            onBlur={(event) => {
              setIsFocused(false);
              return onBlur?.(event);
            }}
            onChange={(event) => {
              setHasValue(Boolean(event.target.value));
              return onChange?.(event);
            }}
          />
          {suffix &&
            cloneElement(suffix, {
              className: classNames([suffix.props.className, styles.suffix]),
            })}
        </div>
        <NotchedBorder
          label={label ?? ''}
          isActive={isActive}
          isDanger={Boolean(isDanger)}
          isFocused={isFocused}
        />
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
