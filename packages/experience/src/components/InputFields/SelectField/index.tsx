import { type Nullable } from '@silverhand/essentials';
import classNames from 'classnames';
import { useRef, useState, useEffect } from 'react';

import ArrowDown from '@/assets/icons/arrow-down.svg?react';
import Dropdown, { DropdownItem } from '@/components/Dropdown';
import { onKeyDownHandler } from '@/utils/a11y';

import InputField from '../InputField';

import styles from './index.module.scss';

type Props = {
  readonly className?: string;
  readonly name?: string;
  readonly options: Array<{ value: string; label: string }>;
  readonly value?: string;
  readonly description?: Nullable<string>;
  readonly label?: string;
  readonly placeholder?: string;
  readonly errorMessage?: string;
  // eslint-disable-next-line react/boolean-prop-naming
  readonly required?: boolean;
  readonly onBlur?: () => void;
  readonly onChange: (value: string) => void;
};

const SelectField = ({
  className,
  name,
  options,
  value,
  description,
  label,
  placeholder,
  errorMessage,
  required,
  onBlur,
  onChange,
}: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [currentValue, setCurrentValue] = useState(
    options.find((option) => option.value === value)?.label ?? ''
  );
  const [focusedIndex, setFocusedIndex] = useState<number>();
  const optionElementReferences = useRef<Array<HTMLDivElement | undefined>>([]);

  useEffect(() => {
    if (isOpen && focusedIndex !== undefined) {
      optionElementReferences.current[focusedIndex]?.focus();
    }
  }, [isOpen, focusedIndex]);

  const moveFocus = (direction: 1 | -1) => {
    setFocusedIndex((previous) => {
      if (options.length === 0) {
        return previous;
      }
      if (previous === undefined) {
        return direction === 1 ? 0 : options.length - 1;
      }
      // Wrap around from the start or end
      return (previous + direction + options.length) % options.length;
    });
  };

  const handleArrowNavigation = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (isOpen) {
        moveFocus(event.key === 'ArrowDown' ? 1 : -1);
      } else {
        setIsOpen(true);
        const direction = event.key === 'ArrowDown' ? 1 : -1;
        setFocusedIndex(direction === 1 ? 0 : options.length - 1);
      }
    }
  };

  const handleSelectViaKeyboard = (event: React.KeyboardEvent) => {
    if ((event.key === 'Enter' || event.key === ' ') && isOpen && focusedIndex !== undefined) {
      const targetOption = options[focusedIndex];
      if (targetOption) {
        event.preventDefault();
        onChange(targetOption.value);
        setCurrentValue(targetOption.label);
        setIsOpen(false);
      }
    }
  };

  return (
    <div className={classNames(styles.selectContainer, className)}>
      <div ref={ref} className={styles.select}>
        <InputField
          readOnly
          name={name}
          label={label}
          placeholder={placeholder}
          isDanger={!!errorMessage}
          required={required}
          value={currentValue}
          onClick={() => {
            setFocusedIndex(undefined);
            setIsOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setIsOpen(false);
              return;
            }
            onKeyDownHandler(() => {
              setFocusedIndex(undefined);
              setIsOpen(true);
            })(event);
            handleArrowNavigation(event);
            handleSelectViaKeyboard(event);
          }}
          onBlur={onBlur}
        />
        <Dropdown
          isFullWidth
          anchorRef={ref}
          className={styles.dropdown}
          isOpen={isOpen}
          horizontalAlign="start"
          onClose={() => {
            setIsOpen(false);
          }}
        >
          {options.map((option, index) => (
            <DropdownItem
              key={option.value}
              ref={(element) => {
                // eslint-disable-next-line @silverhand/fp/no-mutation
                optionElementReferences.current[index] = element ?? undefined;
              }}
              onArrowNavigate={moveFocus}
              onClick={() => {
                onChange(option.value);
                setCurrentValue(option.label);
                setIsOpen(false);
              }}
            >
              {option.label}
            </DropdownItem>
          ))}
        </Dropdown>
        <div
          tabIndex={0}
          role="button"
          className={classNames(styles.arrow, isOpen && styles.up)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setIsOpen(false);
            }
            onKeyDownHandler(() => {
              setIsOpen((previous) => {
                const next = !previous;
                if (next) {
                  setFocusedIndex(undefined);
                }
                return next;
              });
            })(event);
            handleArrowNavigation(event);
          }}
        >
          <ArrowDown />
        </div>
      </div>
      {description && <div className={styles.description}>{description}</div>}
      {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
    </div>
  );
};

export default SelectField;
