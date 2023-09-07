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
  useState,
} from 'react';

import EyeClosed from '@/assets/icons/eye-closed.svg';
import Eye from '@/assets/icons/eye.svg';
import IconButton from '@/ds-components/IconButton';

import * as styles from './index.module.scss';

type Props = Omit<HTMLProps<HTMLInputElement>, 'size'> & {
  error?: string | boolean;
  icon?: ReactElement;
  /**
   * An element to be rendered on the right side of the input.
   * By default, the suffix is only visible when the input is focused.
   */
  suffix?: ReactElement<Record<string, unknown>>;
  /** Whether to always show the suffix. */
  // eslint-disable-next-line react/boolean-prop-naming
  alwaysShowSuffix?: boolean;
  isConfidential?: boolean;
};

function TextInput(
  {
    error,
    icon,
    suffix,
    alwaysShowSuffix = false,
    disabled,
    className,
    readOnly,
    type = 'text',
    isConfidential = false,
    ...rest
  }: Props,
  reference: Ref<Nullable<HTMLInputElement>>
) {
  const innerRef = useRef<HTMLInputElement>(null);
  const [isContentHidden, setIsContentHidden] = useState(true);

  const toggleHiddenContent = () => {
    setIsContentHidden((previous) => !previous);
  };

  const suffixIcon =
    isConfidential && type === 'text' ? (
      <IconButton onClick={toggleHiddenContent}>
        {isContentHidden ? <EyeClosed /> : <Eye />}
      </IconButton>
    ) : (
      suffix
    );

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
          Boolean(error) && styles.error,
          isConfidential && isContentHidden && type === 'text' && styles.hideTextContainerContent,
          icon && styles.withIcon,
          disabled && styles.disabled,
          readOnly && styles.readOnly
        )}
      >
        {icon && <span className={styles.icon}>{icon}</span>}
        <input type={type} {...rest} ref={innerRef} disabled={disabled} readOnly={readOnly} />
        {suffixIcon &&
          cloneElement(suffixIcon, {
            className: classNames(
              // Handle by classNames
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
              suffixIcon.props.className,
              styles.suffix,
              alwaysShowSuffix && styles.visible
            ),
          })}
      </div>
      {Boolean(error) && typeof error === 'string' && (
        <div className={styles.errorMessage}>{error}</div>
      )}
    </div>
  );
}

export default forwardRef(TextInput);
