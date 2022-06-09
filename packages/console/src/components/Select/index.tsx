import classNames from 'classnames';
import React, { ReactEventHandler, ReactNode, useRef, useState } from 'react';

import { KeyboardArrowDown, KeyboardArrowUp } from '@/icons/Arrow';
import Close from '@/icons/Close';

import Dropdown, { DropdownItem } from '../Dropdown';
import IconButton from '../IconButton';
import * as styles from './index.module.scss';

type Option<T> = {
  value: T;
  title: ReactNode;
};

type Props<T> = {
  value?: T;
  options: Array<Option<T>>;
  onChange?: (value?: T) => void;
  isReadOnly?: boolean;
  hasError?: boolean;
  placeholder?: ReactNode;
  isClearable?: boolean;
  size?: 'small' | 'medium';
};

const Select = <T extends string>({
  value,
  options,
  onChange,
  isReadOnly,
  hasError,
  placeholder,
  isClearable,
  size = 'medium',
}: Props<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef<HTMLInputElement>(null);
  const current = options.find((option) => value && option.value === value);

  const handleSelect = (value: T) => {
    onChange?.(value);
    setIsOpen(false);
  };

  const handleClear: ReactEventHandler<HTMLButtonElement> = (event) => {
    onChange?.(undefined);
    setIsOpen(false);
    event.stopPropagation();
  };

  return (
    <>
      <div
        ref={anchorRef}
        className={classNames(
          styles.select,
          styles[size],
          isOpen && styles.open,
          isReadOnly && styles.readOnly,
          hasError && styles.error,
          isClearable && value && styles.clearable
        )}
        role="button"
        onClick={() => {
          if (!isReadOnly) {
            setIsOpen(true);
          }
        }}
      >
        {current?.title ?? placeholder}
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
      <Dropdown
        isFullWidth
        anchorRef={anchorRef}
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
      >
        {options.map(({ value, title }) => (
          <DropdownItem
            key={value}
            onClick={() => {
              handleSelect(value);
            }}
          >
            {title}
          </DropdownItem>
        ))}
      </Dropdown>
    </>
  );
};

export default Select;
