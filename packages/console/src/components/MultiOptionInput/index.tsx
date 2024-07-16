import { isKeyInObject, type Nullable } from '@silverhand/essentials';
import classNames from 'classnames';
import { type ReactNode, useRef, useState, useCallback } from 'react';

import Close from '@/assets/icons/close.svg';
import IconButton from '@/ds-components/IconButton';
import Tag from '@/ds-components/Tag';
import { onKeyDownHandler } from '@/utils/a11y';

import * as styles from './index.module.scss';

type CanBePromise<T> = T | Promise<T>;

type Props<T> = {
  readonly className?: string;
  readonly valueClassName?: string | ((value: T) => string | undefined);
  readonly values: T[];
  readonly getId?: (value: T) => string;
  readonly onError?: (error: string) => void;
  readonly onClearError?: () => void;
  readonly onChange: (values: T[]) => void;
  readonly renderValue: (value: T) => ReactNode;
  /** Give a text input, return the parsed value or an error message if it cannot be parsed. */
  readonly validateInput: (text: string) => CanBePromise<{ value: T } | string>;
  readonly error?: string | boolean;
  readonly placeholder?: string;
};

function MultiOptionInput<T>({
  className,
  valueClassName,
  values,
  getId: getIdInput,
  onError,
  onClearError,
  renderValue,
  onChange,
  error,
  placeholder,
  validateInput,
}: Props<T>) {
  const ref = useRef<HTMLInputElement>(null);
  const [focusedValueId, setFocusedValueId] = useState<Nullable<string>>(null);
  const [currentValue, setCurrentValue] = useState('');
  const getId = useCallback(
    (value: T): string => {
      if (getIdInput) {
        return getIdInput(value);
      }

      if (isKeyInObject(value, 'id')) {
        return String(value.id);
      }

      return String(value);
    },
    [getIdInput]
  );

  const handleChange = (values: T[]) => {
    onClearError?.();
    onChange(values);
  };

  const handleAdd = async (text: string) => {
    const result = await validateInput(text);

    if (typeof result === 'string') {
      onError?.(result);
      return;
    }

    handleChange([...values, result.value]);
    setCurrentValue('');
    ref.current?.focus();
  };

  const handleDelete = (option: T) => {
    onChange(values.filter((value) => getId(value) !== getId(option)));
  };

  return (
    <>
      <div
        className={classNames(styles.input, Boolean(error) && styles.error, className)}
        role="button"
        tabIndex={0}
        onKeyDown={onKeyDownHandler(() => {
          ref.current?.focus();
        })}
        onClick={() => {
          ref.current?.focus();
        }}
      >
        {placeholder && values.length === 0 && !currentValue && (
          <div className={styles.placeholder}>{placeholder}</div>
        )}
        <div className={styles.wrapper}>
          {values.map((option) => (
            <Tag
              key={getId(option)}
              variant="cell"
              className={classNames(
                styles.tag,
                getId(option) === focusedValueId && styles.focused,
                typeof valueClassName === 'function' ? valueClassName(option) : valueClassName
              )}
              onClick={() => {
                ref.current?.focus();
              }}
            >
              {renderValue(option)}
              <IconButton
                className={styles.delete}
                size="small"
                onClick={() => {
                  handleDelete(option);
                }}
                onKeyDown={onKeyDownHandler(() => {
                  handleDelete(option);
                })}
              >
                <Close className={styles.close} />
              </IconButton>
            </Tag>
          ))}
          <input
            ref={ref}
            value={currentValue}
            onKeyDown={async (event) => {
              switch (event.key) {
                case 'Backspace': {
                  if (currentValue === '') {
                    if (focusedValueId) {
                      onChange(values.filter((value) => getId(value) !== focusedValueId));
                      setFocusedValueId(null);
                    } else {
                      const lastValue = values.at(-1);
                      setFocusedValueId(lastValue ? getId(lastValue) : null);
                    }
                    ref.current?.focus();
                  }
                  break;
                }
                case ' ':
                case 'Enter': {
                  // Do not react to "Enter"
                  event.preventDefault();
                  // Focusing on input
                  if (currentValue !== '' && document.activeElement === ref.current) {
                    await handleAdd(currentValue);
                  }
                  break;
                }
                default:
              }
            }}
            onChange={({ currentTarget: { value } }) => {
              setCurrentValue(value);
              setFocusedValueId(null);
            }}
            onFocus={() => {
              ref.current?.focus();
            }}
            onBlur={async () => {
              if (currentValue !== '') {
                await handleAdd(currentValue);
              }
              setFocusedValueId(null);
            }}
          />
        </div>
      </div>
      {Boolean(error) && typeof error === 'string' && (
        <div className={styles.errorMessage}>{error}</div>
      )}
    </>
  );
}

export default MultiOptionInput;
