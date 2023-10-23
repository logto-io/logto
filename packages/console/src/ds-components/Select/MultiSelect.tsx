import { type AdminConsoleKey } from '@logto/phrases';
import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Close from '@/assets/icons/close.svg';
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
  className?: string;
  value: Array<Option<T>>;
  options: Array<Option<T>>;
  onSearch: (keyword: string) => void;
  onChange: (value: Array<Option<T>>) => void;
  isReadOnly?: boolean;
  error?: string | boolean;
  placeholder?: AdminConsoleKey;
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
}: Props<T>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLDivElement>(null);
  const [keyword, setKeyword] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
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

  const isOpen = !isReadOnly && isInputFocused;
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
        const { value, title } = option;
        return (
          <Tag
            key={value}
            variant="cell"
            className={styles.tag}
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            {title ?? value}
            <IconButton
              className={styles.delete}
              size="small"
              onClick={() => {
                handleDelete(option);
              }}
            >
              <Close className={styles.close} />
            </IconButton>
          </Tag>
        );
      })}
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder && String(t(placeholder))}
        value={keyword}
        onChange={({ currentTarget: { value } }) => {
          setKeyword(value);
        }}
        onFocus={() => {
          setIsInputFocused(true);
        }}
        onBlur={() => {
          setIsInputFocused(false);
        }}
      />
      <Dropdown
        isFullWidth
        noOverlay
        isOpen={isOpen}
        className={styles.dropdown}
        anchorRef={selectRef}
      >
        {filteredOptions.length === 0 && <div className={styles.noResult}>{t('errors.empty')}</div>}
        {filteredOptions.map(({ value, title }) => (
          <DropdownItem
            key={value}
            onClick={(event) => {
              event.preventDefault();
              handleSelect({ value, title });
            }}
          >
            {title ?? value}
          </DropdownItem>
        ))}
      </Dropdown>
    </div>
  );
}

export default MultiSelect;
