import classNames from 'classnames';
import type { ChangeEvent, ReactEventHandler, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Close from '@/assets/icons/close.svg';
import KeyboardArrowDown from '@/assets/icons/keyboard-arrow-down.svg';
import KeyboardArrowUp from '@/assets/icons/keyboard-arrow-up.svg';
import SearchIcon from '@/assets/icons/search.svg';
import { onKeyDownHandler } from '@/utils/a11y';

import IconButton from '../IconButton';
import OverlayScrollbar from '../OverlayScrollbar';

import * as styles from './index.module.scss';

export type Option<T> = {
  value: T;
  title: ReactNode;
};

type Props<T> = {
  className?: string;
  value?: T;
  options: Array<Option<T>>;
  onChange?: (value?: T) => void;
  isReadOnly?: boolean;
  error?: string | boolean;
  placeholder?: ReactNode;
  isClearable?: boolean;
  size?: 'small' | 'medium' | 'large';
  isSearchEnabled?: boolean;
};

function Select<T extends string>({
  className,
  value,
  options,
  onChange,
  isReadOnly,
  error,
  placeholder,
  isClearable,
  size = 'large',
  isSearchEnabled,
}: Props<T>) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const selectContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState<string>('');
  const current = options.find((option) => value && option.value === value);

  const handleSelect = (value: T) => {
    onChange?.(value);
    setIsOpen(false);
    setSearchInputValue('');
  };

  const handleClear: ReactEventHandler<HTMLButtonElement> = (event) => {
    onChange?.(undefined);
    setIsOpen(false);
    event.stopPropagation();
  };

  const clickOutsideHandler = ({ target }: MouseEvent) => {
    if (target instanceof Element && !selectContainerRef.current?.contains(target)) {
      setIsOpen(false);
      setSearchInputValue('');
    }
  };

  useEffect(() => {
    if (isOpen) {
      searchInputRef.current?.focus();
      document.addEventListener('mousedown', clickOutsideHandler);
    } else {
      document.removeEventListener('mousedown', clickOutsideHandler);
    }
    return () => {
      if (isOpen) {
        document.removeEventListener('mousedown', clickOutsideHandler);
      }
    };
  }, [isOpen, searchInputRef]);

  useEffect(() => {
    const optionEls = document.querySelectorAll<HTMLDivElement>('div[data-option]');
    for (const element of optionEls) {
      const value = element.dataset.optionValue ?? '';
      const textContent = element.textContent ?? '';
      if (
        textContent.toLowerCase().includes(searchInputValue.toLowerCase()) ||
        value.toLowerCase().includes(searchInputValue.toLowerCase())
      ) {
        element.style.setProperty('display', 'block');
      } else {
        element.style.setProperty('display', 'none');
      }
    }
  }, [searchInputValue]);

  return (
    <div ref={selectContainerRef} className={styles.selectContainer}>
      <div
        className={classNames(
          styles.select,
          styles[size],
          isOpen && styles.open,
          isReadOnly && styles.readOnly,
          Boolean(error) && styles.error,
          className
        )}
      >
        {isOpen && isSearchEnabled ? (
          <div className={styles.searchBox}>
            <div className={classNames(styles.icon, styles.search)}>
              <SearchIcon />
            </div>
            <input
              ref={searchInputRef}
              placeholder={t('general.type_to_search')}
              value={searchInputValue}
              className={styles.searchInput}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setSearchInputValue(event.target.value);
              }}
            />
          </div>
        ) : (
          <div
            tabIndex={0}
            role="button"
            className={classNames(styles.displayBox, isClearable && value && styles.clearable)}
            onKeyDown={onKeyDownHandler(() => {
              if (!isReadOnly) {
                setIsOpen(true);
              }
            })}
            onClick={() => {
              setIsOpen((previous) => (isReadOnly ? false : !previous));
            }}
          >
            <div className={styles.title}>{current?.title ?? placeholder}</div>
            {isClearable && (
              <IconButton
                className={classNames(styles.icon, styles.clear)}
                size="small"
                onClick={handleClear}
              >
                <Close />
              </IconButton>
            )}
            <div className={classNames(styles.icon, styles.arrow)}>
              {isOpen ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </div>
          </div>
        )}
      </div>
      {isOpen && (
        <OverlayScrollbar className={styles.menu}>
          {options.map(({ value, title }) => (
            <div
              key={value}
              data-option
              tabIndex={0}
              role="tab"
              className={styles.option}
              data-option-value={value}
              onClick={() => {
                handleSelect(value);
              }}
              onKeyDown={onKeyDownHandler(() => {
                handleSelect(value);
              })}
            >
              {title}
            </div>
          ))}
        </OverlayScrollbar>
      )}
    </div>
  );
}

export default Select;
