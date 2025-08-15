import { type Nullable } from '@silverhand/essentials';
import classNames from 'classnames';
import { useRef, useState } from 'react';

import ArrowDown from '@/assets/icons/arrow-down.svg?react';
import Dropdown, { DropdownItem } from '@/components/Dropdown';

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
            setIsOpen(true);
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
          {options.map((option) => (
            <DropdownItem
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setCurrentValue(option.label);
              }}
            >
              {option.label}
            </DropdownItem>
          ))}
        </Dropdown>
        <div className={classNames(styles.arrow, isOpen && styles.up)}>
          <ArrowDown />
        </div>
      </div>
      {description && <div className={styles.description}>{description}</div>}
      {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
    </div>
  );
};

export default SelectField;
