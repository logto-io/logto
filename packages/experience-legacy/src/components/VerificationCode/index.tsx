import type { FormEventHandler, KeyboardEventHandler, ClipboardEventHandler } from 'react';
import { useMemo, useRef, useCallback, useEffect } from 'react';

import ErrorMessage from '@/components/ErrorMessage';

import styles from './index.module.scss';

export const defaultLength = 6;

export type Props = {
  readonly name: string;
  readonly className?: string;
  readonly length?: number;
  readonly value: string[];
  readonly error?: string;
  readonly onChange: (value: string[]) => void;
};

const isNumeric = (char: string) => /^\d+$/.test(char);

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

const VerificationCode = ({
  name,
  className,
  value,
  length = defaultLength,
  error,
  onChange,
}: Props) => {
  /* eslint-disable @typescript-eslint/ban-types */
  const inputReferences = useRef<Array<HTMLInputElement | null>>(
    Array.from<null>({ length }).fill(null)
  );
  /* eslint-enable @typescript-eslint/ban-types */

  const codes = useMemo(() => normalize(value, length), [length, value]);

  const updateValue = useCallback(
    (data: string, targetId: number) => {
      // Filter non-numeric input
      if (!isNumeric(data)) {
        return;
      }

      const chars = data.split('');
      const trimmedChars = chars.slice(0, Math.min(chars.length, codes.length - targetId));

      const value = [
        ...codes.slice(0, targetId),
        ...trimmedChars,
        ...codes.slice(targetId + trimmedChars.length, codes.length),
      ];

      onChange(value);

      // Move to the next target
      const nextTarget =
        inputReferences.current[Math.min(targetId + trimmedChars.length, codes.length - 1)];
      nextTarget?.focus();
    },
    [codes, onChange]
  );

  const onInputHandler: FormEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      const { target } = event;

      if (!(target instanceof HTMLInputElement)) {
        return;
      }

      const { value, dataset } = target;

      // Unrecognized target input field
      if (!dataset.id) {
        return;
      }

      event.preventDefault();
      updateValue(value, Number(dataset.id));
    },
    [updateValue]
  );

  const onPasteHandler: ClipboardEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      if (!(event.target instanceof HTMLInputElement)) {
        return;
      }

      const {
        target: { dataset },
        clipboardData,
      } = event;

      const data = clipboardData.getData('text').match(/\d/g)?.join('') ?? '';

      // Unrecognized target input field
      if (!dataset.id) {
        return;
      }

      event.preventDefault();
      updateValue(data, Number(dataset.id));
    },
    [updateValue]
  );

  const onKeyDownHandler: KeyboardEventHandler<HTMLInputElement> = useCallback(
    (event) => {
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
        case 'Backspace': {
          event.preventDefault();

          if (value) {
            onChange(Object.assign([], codes, { [targetId]: '' }));
            break;
          }

          if (previousTarget) {
            previousTarget.focus();
            onChange(Object.assign([], codes, { [targetId - 1]: '' }));
          }

          break;
        }

        case 'ArrowLeft': {
          event.preventDefault();
          previousTarget?.focus();
          break;
        }

        case 'ArrowRight': {
          event.preventDefault();
          nextTarget?.focus();
          break;
        }
        case '+':
        case '-':
        case 'e':
        case '.':
        case 'ArrowUp':
        case 'ArrowDown': {
          event.preventDefault();
          break;
        }

        default: {
          break;
        }
      }
    },
    [codes, onChange]
  );

  useEffect(() => {
    if (value.length === 0) {
      inputReferences.current[0]?.focus();
    }
  }, [value]);

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
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
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

export default VerificationCode;
