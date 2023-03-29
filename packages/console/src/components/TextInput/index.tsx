import { type Nullable } from '@silverhand/essentials';
import classNames from 'classnames';
import {
  type HTMLProps,
  type ReactElement,
  useImperativeHandle,
  useRef,
  cloneElement,
  forwardRef,
  type Ref,
  useEffect,
} from 'react';

import * as styles from './index.module.scss';

type Props = Omit<HTMLProps<HTMLInputElement>, 'size'> & {
  hasError?: boolean;
  errorMessage?: string;
  icon?: ReactElement;
  suffix?: ReactElement;
};

function TextInput(
  {
    errorMessage,
    hasError = Boolean(errorMessage),
    icon,
    suffix,
    disabled,
    className,
    readOnly,
    type = 'text',
    ...rest
  }: Props,
  reference: Ref<Nullable<HTMLInputElement>>
) {
  const innerRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(reference, () => innerRef.current);

  useEffect(() => {
    if (type !== 'number') {
      return;
    }

    const input = innerRef.current;

    if (!input) {
      return;
    }

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
    };

    input.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      input.removeEventListener('wheel', handleWheel);
    };
  }, [type]);

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
        <input type={type} {...rest} ref={innerRef} disabled={disabled} readOnly={readOnly} />
        {suffix &&
          cloneElement(suffix, {
            className: classNames([suffix.props.className, styles.suffix]),
          })}
      </div>
      {hasError && errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
    </div>
  );
}

export default forwardRef(TextInput);
