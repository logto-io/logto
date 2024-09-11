import classNames from 'classnames';
import { type ComponentProps } from 'react';

import CaretDown from '@/assets/icons/caret-down.svg?react';
import CaretUp from '@/assets/icons/caret-up.svg?react';
import { onKeyDownHandler } from '@/utils/a11y';

import styles from './NumericInput.module.scss';
import TextInput from './index';

type ButtonProps = {
  readonly className?: string;
  readonly onTrigger?: (
    event: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>
  ) => void;
  readonly children: React.ReactNode;
  readonly isDisabled?: boolean;
};

function Button({ className, onTrigger, children, isDisabled }: ButtonProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      className={classNames(styles.button, isDisabled && styles.disabled, className)}
      aria-disabled={isDisabled}
      onKeyDown={onKeyDownHandler(onTrigger)}
      onClick={(event) => {
        event.preventDefault();
        if (isDisabled) {
          return;
        }
        onTrigger?.(event);
      }}
    >
      {children}
    </div>
  );
}

type Props = Omit<ComponentProps<typeof TextInput>, 'type' | 'suffix'> & {
  /** The event handler for when the value is incremented by the up button. */
  readonly onValueUp: ButtonProps['onTrigger'];
  /** The event handler for when the value is decremented by the down button. */
  readonly onValueDown: ButtonProps['onTrigger'];
};

/** A numeric text input with up and down buttons for incrementing and decrementing the value. */
function NumericInput({ onValueUp, onValueDown, ...props }: Props) {
  const isDisabled = Boolean(props.disabled) || Boolean(props.readOnly);

  return (
    <TextInput
      {...props}
      alwaysShowSuffix
      type="number"
      suffix={
        <div className={styles.container}>
          <Button
            className={styles.up}
            isDisabled={
              isDisabled ||
              (props.value !== undefined &&
                props.max !== undefined &&
                Number(props.value) >= Number(props.max))
            }
            onTrigger={onValueUp}
          >
            <CaretUp />
          </Button>
          <Button
            className={styles.down}
            isDisabled={
              isDisabled ||
              (props.value !== undefined &&
                props.min !== undefined &&
                Number(props.value) <= Number(props.min))
            }
            onTrigger={onValueDown}
          >
            <CaretDown />
          </Button>
        </div>
      }
    />
  );
}

export default NumericInput;
