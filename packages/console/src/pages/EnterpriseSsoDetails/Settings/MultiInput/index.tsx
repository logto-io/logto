import { type AdminConsoleKey } from '@logto/phrases';
import { generateStandardShortId } from '@logto/shared/universal';
import { conditional, type Nullable } from '@silverhand/essentials';
import classNames from 'classnames';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Close from '@/assets/icons/close.svg';
import IconButton from '@/ds-components/IconButton';
import Tag, { type Props as TagProps } from '@/ds-components/Tag';
import { onKeyDownHandler } from '@/utils/a11y';

import * as styles from './index.module.scss';

export type Option = {
  /**
   * Generate a random unique id for each option to handle deletion.
   * Sometimes we may have options with the same value, which is allowed when inputting but prohibited when submitting.
   */
  id: string;
  value: string;
  /**
   * The `status` is used to indicate the status of the domain item (could fall into following categories):
   * - undefined: valid domain
   * - 'info': duplicated domain or blocked domain, see {@link packages/schemas/src/utils/domain.ts}.
   */
  status?: Extract<TagProps['status'], 'info'>;
};

type Props = {
  className?: string;
  values: Option[];
  onChange: (values: Option[]) => void;
  error?: string | boolean;
  placeholder?: AdminConsoleKey;
};

// RegExp to domain string.
// eslint-disable-next-line prefer-regex-literals
const domainRegExp = new RegExp('\\S+[\\.]{1}\\S+');

function MultiInput({ className, values, onChange, error, placeholder }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focusedValueId, setFocusedValueId] = useState<Nullable<string>>(null);
  const [currentValue, setCurrentValue] = useState('');
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const isCurrentValueValidDomain = useMemo(() => {
    return domainRegExp.test(currentValue);
  }, [currentValue]);

  const handleAdd = (value: string) => {
    const newValues = [...values, { value, id: generateStandardShortId() }];
    onChange(newValues);
    setCurrentValue('');
    inputRef.current?.focus();
  };

  const handleDelete = (option: Option) => {
    onChange(values.filter(({ id }) => id !== option.id));
  };

  return (
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
          if (event.key === 'Space') {
            // Do not react to "Space", since a valid domain does not contain spaces.
            event.preventDefault();
          }
          if (event.key === 'Enter') {
            // Focusing on input
            if (isCurrentValueValidDomain && document.activeElement === inputRef.current) {
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
          setFocusedValueId(null);
        }}
      />
    </div>
  );
}

export default MultiInput;
