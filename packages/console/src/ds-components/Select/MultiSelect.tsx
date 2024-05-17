import { type AdminConsoleKey } from '@logto/phrases';
import { type Nullable, cond } from '@silverhand/essentials';
import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Close from '@/assets/icons/close.svg';
import { Ring as Spinner } from '@/ds-components/Spinner';
import { onKeyDownHandler } from '@/utils/a11y';

import Dropdown, { DropdownItem } from '../Dropdown';
import IconButton from '../IconButton';
import Tag from '../Tag';

import * as styles from './index.module.scss';

export type Option<T> = {
  value: T;
  title?: string;
};

type Props<T> = {
  readonly className?: string;
  readonly value: Array<Option<T>>;
  readonly options: Array<Option<T>>;
  readonly onSearch: (keyword: string) => void;
  readonly onChange: (value: Array<Option<T>>) => void;
  readonly isReadOnly?: boolean;
  readonly error?: string | boolean;
  readonly placeholder?: AdminConsoleKey;
  readonly isOptionsLoading?: boolean;
  readonly renderOption?: (option: Option<T>) => React.ReactNode;
};

function MultiSelect<T extends string>({
  className,
  value,
  options,
  onSearch,
  onChange,
  isReadOnly,
  error,
  placeholder,
  isOptionsLoading,
  renderOption = ({ title, value }) => title ?? value,
}: Props<T>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLDivElement>(null);
  const [keyword, setKeyword] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  // Used to focus on the last tag to perform deletion
  const [focusedValue, setFocusedValue] = useState<Nullable<T>>(null);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  // Search on keyword changes
  useEffect(() => {
    if (isInputFocused) {
      onSearch(keyword);
    }
  }, [keyword, isInputFocused, onSearch]);

  const handleSelect = (option: Option<T>) => {
    if (value.some(({ value }) => value === option.value)) {
      return;
    }
    onChange([...value, option]);
    setKeyword('');
    inputRef.current?.focus();
  };

  const handleDelete = (option: Option<T>) => {
    onChange(value.filter(({ value }) => value !== option.value));
  };

  // https://exogen.github.io/blog/focus-state/
  useEffect(() => {
    if (document.hasFocus() && inputRef.current?.contains(document.activeElement)) {
      setIsInputFocused(true);
    }
  }, []);

  const isOpen = !isReadOnly && isInputFocused && !focusedValue;
  const filteredOptions = options.filter(({ value: current }) => {
    return !value.some(({ value }) => value === current);
  });

  return (
    <div
      ref={selectRef}
      className={classNames(
        styles.select,
        styles.multiple,
        isOpen && styles.open,
        isReadOnly && styles.readOnly,
        Boolean(error) && styles.error,
        className
      )}
      role="button"
      tabIndex={0}
      onKeyDown={onKeyDownHandler(() => {
        if (!isReadOnly) {
          inputRef.current?.focus();
        }
      })}
      onClick={() => {
        if (!isReadOnly) {
          inputRef.current?.focus();
        }
      }}
    >
      {value.map((option) => {
        return (
          <Tag
            key={option.value}
            variant="cell"
            className={classNames(styles.tag, option.value === focusedValue && styles.focused)}
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            {renderOption(option)}
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
        type="text"
        placeholder={cond(value.length === 0 && placeholder && String(t(placeholder)))}
        value={keyword}
        onKeyDown={(event) => {
          if (event.key === 'Backspace' && keyword === '') {
            if (focusedValue) {
              onChange(value.filter(({ value }) => value !== focusedValue));
              setFocusedValue(null);
            } else {
              setFocusedValue(value.at(-1)?.value ?? null);
            }
            event.stopPropagation();
          }
        }}
        onChange={({ currentTarget: { value } }) => {
          setKeyword(value);
          setFocusedValue(null);
        }}
        onFocus={() => {
          setIsInputFocused(true);
        }}
        onBlur={() => {
          setIsInputFocused(false);
          setFocusedValue(null);
        }}
      />
      <Dropdown
        isFullWidth
        noOverlay
        isOpen={isOpen}
        className={styles.dropdown}
        anchorRef={selectRef}
      >
        {isOptionsLoading && <Spinner className={styles.spinner} />}
        {!isOptionsLoading && (
          <>
            {filteredOptions.length === 0 && (
              <div className={styles.noResult}>{t('errors.empty')}</div>
            )}
            {filteredOptions.map((option) => (
              <DropdownItem
                key={option.value}
                onClick={(event) => {
                  event.preventDefault();
                  handleSelect(option);
                }}
              >
                {renderOption(option)}
              </DropdownItem>
            ))}
          </>
        )}
      </Dropdown>
    </div>
  );
}

export default MultiSelect;
