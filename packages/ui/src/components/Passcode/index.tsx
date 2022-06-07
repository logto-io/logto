import React, {
  useMemo,
  useRef,
  useCallback,
  useEffect,
  FormEventHandler,
  KeyboardEventHandler,
  ClipboardEventHandler,
} from 'react';

import ErrorMessage from '@/components/ErrorMessage';

import * as styles from './index.module.scss';

export const defaultLength = 6;

export type Props = {
  name: string;
  className?: string;
  length?: number;
  value: string[];
  error?: string;
  onChange: (value: string[]) => void;
};

const isNumeric = (char: string) => /^\d*$/.test(char);

const normalize = (value: string[], length: number): string[] => {
  if (value.length > length) {
    return value.slice(0, length);
  }

  if (value.length < length) {
    // Undefined will not overwrite the original input displays, need to pass in empty string instead
    return value.concat(Array.from<string>({ length: length - value.length }).fill(''));
  }

  return value;
};

const trim = (oldValue: string | undefined, newValue: string) => {
  // Pop oldValue from the latest input to get the updated Digit
  if (newValue.length > 1 && oldValue) {
    return newValue.replace(oldValue, '');
  }

  return newValue;
};

const Passcode = ({ name, className, value, length = defaultLength, error, onChange }: Props) => {
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

      // Update the root input value
      onChange(Object.assign([], codes, { [targetId]: trim(codes[targetId], value) }));

      // Move to the next target
      if (value) {
        const nextTarget = inputReferences.current[targetId + 1];
        nextTarget?.focus();
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
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        previousTarget?.focus();
        break;
      case 'ArrowRight':
        event.preventDefault();
        nextTarget?.focus();
        break;
      case 'ArrowUp':
      case 'ArrowDown':
        event.preventDefault();
        break;
      default:
        break;
    }
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

  useEffect(() => {
    if (value.length === 0) {
      inputReferences.current[0]?.focus();
    }
  }, [value, onChange]);

  return (
    <div className={className}>
      <div className={styles.passcode}>
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
            value={codes[index]}
            type="text" // Number type allows 'e' as input but returns empty value
            inputMode="numeric"
            maxLength={2} // Allow overwrite input
            autoComplete="off"
            onPaste={onPasteHandler}
            onInput={onInputHandler}
            onKeyDown={onKeyDownHandler}
          />
        ))}
      </div>
      {error && <ErrorMessage className={styles.errorMessage}>{error}</ErrorMessage>}
    </div>
  );
};

export default Passcode;
