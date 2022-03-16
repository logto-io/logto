import classNames from 'classnames';
import React, {
  useMemo,
  useRef,
  useCallback,
  FormEventHandler,
  KeyboardEventHandler,
  FocusEventHandler,
  ClipboardEventHandler,
} from 'react';

import * as styles from './index.module.scss';

export const defaultLength = 6;

export type Props = {
  name: string;
  isDisabled?: boolean;
  className?: string;
  length?: number;
  value: string[];
  hasError?: boolean;
  onChange: (value: string[]) => void;
};

const isNumeric = (char: string) => /^\d*$/.test(char);

const normalize = (value: string[], length: number): string[] => {
  if (value.length > length) {
    return value.slice(0, length);
  }

  if (value.length < length) {
    return value.concat(Array.from({ length: length - value.length }));
  }

  return value;
};

const trim = (oldValue: string | undefined, newValue: string) => {
  // Trim oldValue from the latest input to get the updated char
  if (newValue.length > 1 && oldValue) {
    return newValue.replace(oldValue, '');
  }

  return newValue;
};

const Passcode = ({
  name,
  isDisabled,
  className,
  value,
  length = defaultLength,
  hasError,
  onChange,
}: Props) => {
  /* eslint-disable @typescript-eslint/ban-types */
  const inputReferences = useRef<Array<HTMLInputElement | null>>(
    Array.from<null>({ length }).fill(null)
  );
  /* eslint-enable @typescript-eslint/ban-types */

  const codes = useMemo(() => normalize(value, length), [length, value]);

  const onInputHandler: FormEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      const { target } = event;

      if (!(target instanceof HTMLInputElement)) {
        return;
      }

      const { value, dataset } = target;

      // Unrecognized target input field
      if (dataset.id === undefined) {
        return;
      }

      event.preventDefault();

      // Filter non-numeric input
      if (!isNumeric(value)) {
        return;
      }

      const targetId = Number(dataset.id);

      // Update the total input value
      onChange(Object.assign([], codes, { [targetId]: trim(codes[targetId], value) }));

      // Move to the next target
      if (value) {
        const nextTarget = inputReferences.current[targetId + 1];
        nextTarget?.focus();
        nextTarget?.select();
      }
    },
    [codes, onChange]
  );

  const onKeyDownHandler: KeyboardEventHandler<HTMLInputElement> = useCallback((event) => {
    const { key, target } = event;

    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    const { value, dataset } = target;

    if (!dataset.id) {
      return;
    }

    const targetId = Number(dataset.id);

    const nextTarget = inputReferences.current[targetId + 1];
    const previousTarget = inputReferences.current[targetId - 1];

    switch (key) {
      case 'Backspace':
        if (!value) {
          previousTarget?.focus();
          previousTarget?.select();
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        previousTarget?.focus();
        previousTarget?.select();
        break;
      case 'ArrowRight':
        event.preventDefault();
        nextTarget?.focus();
        nextTarget?.select();
        break;
      case 'ArrowUp':
      case 'ArrowDown':
        event.preventDefault();
        break;
      default:
        break;
    }
  }, []);

  const onFocusHandler: FocusEventHandler<HTMLInputElement> = useCallback(({ target }) => {
    target.select();
  }, []);

  const onPasteHandler: ClipboardEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      if (!(event.target instanceof HTMLInputElement)) {
        return;
      }

      const {
        target: { dataset },
        clipboardData,
      } = event;

      if (!dataset.id) {
        return;
      }

      event.preventDefault();

      const data = clipboardData.getData('text');

      if (!data || !isNumeric(data)) {
        return;
      }

      const chars = data.split('');
      const targetId = Number(dataset.id);
      const trimmedChars = chars.slice(0, Math.min(chars.length, codes.length - targetId));

      const value = [
        ...codes.slice(0, targetId),
        ...trimmedChars,
        ...codes.slice(targetId + trimmedChars.length, codes.length),
      ];

      onChange(value);
    },
    [codes, onChange]
  );

  return (
    <div className={classNames(styles.passcode, className)}>
      {Array.from({ length }).map((_, index) => (
        <input
          ref={(element) => {
            // eslint-disable-next-line @silverhand/fp/no-mutation
            inputReferences.current[index] = element;
          }}
          // eslint-disable-next-line react/no-array-index-key
          key={`${name}_${index}`}
          name={`${name}_${index}`}
          data-id={index}
          disabled={isDisabled}
          value={codes[index]}
          className={hasError ? styles.error : undefined}
          type="text"
          inputMode="numeric"
          maxLength={2} // Allow overwrite input
          onPaste={onPasteHandler}
          onInput={onInputHandler}
          onKeyDown={onKeyDownHandler}
          onFocus={onFocusHandler}
        />
      ))}
    </div>
  );
};

export default Passcode;
