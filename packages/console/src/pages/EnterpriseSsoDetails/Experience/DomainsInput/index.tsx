import { type AdminConsoleKey } from '@logto/phrases';
import { generateStandardShortId } from '@logto/shared/universal';
import { conditional, type Nullable } from '@silverhand/essentials';
import classNames from 'classnames';
import { useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Close from '@/assets/icons/close.svg';
import IconButton from '@/ds-components/IconButton';
import Tag from '@/ds-components/Tag';
import { onKeyDownHandler } from '@/utils/a11y';

import { domainRegExp } from './consts';
import * as styles from './index.module.scss';
import { domainOptionsParser, type Option } from './utils';

export type DomainsFormType = {
  domains: Option[];
};

type Props = {
  readonly className?: string;
  readonly values: Option[];
  readonly onChange: (values: Option[]) => void;
  readonly error?: string | boolean;
  readonly placeholder?: AdminConsoleKey;
};

// TODO: @Charles refactor me, use `<MultiOptionInput />` instead.
function DomainsInput({ className, values, onChange: rawOnChange, error, placeholder }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focusedValueId, setFocusedValueId] = useState<Nullable<string>>(null);
  const [currentValue, setCurrentValue] = useState('');
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { setError, clearErrors } = useFormContext<DomainsFormType>();

  const onChange = (values: Option[]) => {
    const { values: parsedValues, errorMessage } = domainOptionsParser(values);
    if (errorMessage) {
      setError('domains', { type: 'custom', message: errorMessage });
    } else {
      clearErrors('domains');
    }
    rawOnChange(parsedValues);
  };

  const handleAdd = (value: string) => {
    const newValues: Option[] = [
      ...values,
      {
        value,
        id: generateStandardShortId(),
        ...conditional(!domainRegExp.test(value) && { status: 'info' }),
      },
    ];
    onChange(newValues);
    setCurrentValue('');
    inputRef.current?.focus();
  };

  const handleDelete = (option: Option) => {
    onChange(values.filter(({ id }) => id !== option.id));
  };

  return (
    <>
      <div
        className={classNames(
          styles.input,
          styles.multiple,
          Boolean(error) && styles.error,
          className
        )}
        role="button"
        tabIndex={0}
        onKeyDown={onKeyDownHandler(() => {
          inputRef.current?.focus();
        })}
        onClick={() => {
          inputRef.current?.focus();
        }}
      >
        {values.map((option) => {
          return (
            <Tag
              key={option.id}
              variant="cell"
              className={classNames(
                styles.tag,
                option.status && styles[option.status],
                option.id === focusedValueId && styles.focused
              )}
              onClick={() => {
                inputRef.current?.focus();
              }}
            >
              {option.value}
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
          );
        })}
        <input
          ref={inputRef}
          // Need to use t() to complete the translation with prefix, use String() to convert the result to string.
          // Should not show placeholder when there are values.
          placeholder={conditional(values.length === 0 && placeholder && String(t(placeholder)))}
          value={currentValue}
          onKeyDown={(event) => {
            if (event.key === 'Backspace' && currentValue === '') {
              if (focusedValueId) {
                onChange(values.filter(({ id }) => id !== focusedValueId));
                setFocusedValueId(null);
              } else {
                setFocusedValueId(values.at(-1)?.id ?? null);
              }
              inputRef.current?.focus();
            }
            if (event.key === ' ' || event.code === 'Space' || event.key === 'Enter') {
              // Focusing on input
              if (currentValue !== '' && document.activeElement === inputRef.current) {
                handleAdd(currentValue);
              }
              // Do not react to "Enter"
              event.preventDefault();
            }
          }}
          onChange={({ currentTarget: { value } }) => {
            setCurrentValue(value);
            setFocusedValueId(null);
          }}
          onFocus={() => {
            inputRef.current?.focus();
          }}
          onBlur={() => {
            if (currentValue !== '') {
              handleAdd(currentValue);
            }
            setFocusedValueId(null);
          }}
        />
      </div>
      {Boolean(error) && typeof error === 'string' && (
        <div className={styles.errorMessage}>{error}</div>
      )}
    </>
  );
}

export default DomainsInput;
