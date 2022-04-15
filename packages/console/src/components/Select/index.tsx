import classNames from 'classnames';
import React, { ReactNode, useLayoutEffect, useRef, useState } from 'react';

import { ArrowDown, ArrowUp } from '@/icons/Arrow';

import Dropdown, { DropdownItem } from '../Dropdown';
import * as styles from './index.module.scss';

type Option = {
  value: string;
  title: ReactNode;
};

type Props = {
  value?: string;
  options: Option[];
  onChange?: (value: string) => void;
  isReadOnly?: boolean;
  hasError?: boolean;
};

const Select = ({ value, options, onChange, isReadOnly, hasError }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef<HTMLInputElement>(null);
  const current = options.find((option) => value && option.value === value);
  const [width, setWidth] = useState<number>();

  const handleSelect = (value: string) => {
    onChange?.(value);
    setIsOpen(false);
  };

  useLayoutEffect(() => {
    if (anchorRef.current) {
      const { width } = anchorRef.current.getBoundingClientRect();
      setWidth(width);
    }
  }, []);

  return (
    <>
      <div
        ref={anchorRef}
        className={classNames(
          styles.select,
          isOpen && styles.open,
          isReadOnly && styles.readOnly,
          hasError && styles.error
        )}
        role="button"
        onClick={() => {
          if (!isReadOnly) {
            setIsOpen(true);
          }
        }}
      >
        {current?.title}
        <div className={styles.arrow}>{isOpen ? <ArrowUp /> : <ArrowDown />}</div>
      </div>
      <Dropdown
        width={width}
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
