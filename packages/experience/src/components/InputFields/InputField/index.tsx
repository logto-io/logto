import { condString, type Nullable } from '@silverhand/essentials';
import classNames from 'classnames';
import type { HTMLProps, ReactElement, Ref, AnimationEvent } from 'react';
import {
  forwardRef,
  cloneElement,
  useState,
  useImperativeHandle,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { useTranslation } from 'react-i18next';

import ErrorMessage from '@/components/ErrorMessage';

import NotchedBorder from './NotchedBorder';
import styles from './index.module.scss';

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
  readonly description?: Nullable<string>;
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
    description,
    onFocus,
    onBlur,
    onChange,
    value,
    required = true,
    ...props
  }: Props,
  reference: Ref<Nullable<HTMLInputElement>>
) => {
  const { t, i18n } = useTranslation();
  const innerRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(reference, () => innerRef.current);

  const errorMessages = errorMessage?.split('\n');

  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  useEffect(() => {
    /**
     * Should listen to the value prop to update the hasValue state.
     */
    setHasValue(Boolean(value));
  }, [value]);

  /**
   * Fix the issue that the input field doesn't have the active style when the autofill value is set.
   * We have define a void transition css rule on the input element once it is `:-webkit-autofill`ed.
   * Hook onto this 'animationstart' event to detect the autofill start.
   * see https://stackoverflow.com/questions/11708092/detecting-browser-autofill/41530164#41530164
   */
  const handleAnimationStart = useCallback((event: AnimationEvent<HTMLInputElement>) => {
    /**
     * Because SCSS adds some random characters to the ‘onAutoFillStart’ animation name during the build process, we can’t use the exact name here.
     */
    if (event.animationName.includes('onAutoFillStart')) {
      setHasValue(true);
    }
  }, []);

  const isActive = Boolean(isPrefixVisible) || hasValue || isFocused;
  const labelWithOptionalSuffix = required
    ? label
    : condString(label && t('input.label_with_optional', { label }));

  return (
    <div className={className}>
      <div
        className={classNames(
          styles.container,
          isDanger && styles.danger,
          isActive && styles.active,
          !label && styles.noLabel
        )}
      >
        <div
          className={classNames(
            styles.inputField,
            isSuffixFocusVisible && styles.isSuffixFocusVisible,
            inputFieldClassName,
            styles[i18n.dir()]
          )}
        >
          {prefix}
          <input
            {...props}
            ref={innerRef}
            value={value}
            onAnimationStart={handleAnimationStart}
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
          label={labelWithOptionalSuffix ?? ''}
          isActive={isActive}
          isDanger={Boolean(isDanger)}
          isFocused={isFocused}
        />
      </div>
      {description && <div className={styles.description}>{description}</div>}
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
