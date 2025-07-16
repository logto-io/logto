import { type Nullable } from '@silverhand/essentials';
import { useRef, useState } from 'react';

import Dropdown, { DropdownItem } from '@/components/Dropdown';

import InputField from '../InputField';

import styles from './index.module.scss';

type Props = {
  readonly options: Array<{ value: string; label: string }>;
  readonly value?: string;
  readonly description?: Nullable<string>;
  readonly label?: string;
  readonly placeholder?: string;
  readonly errorMessage?: string;
  readonly onBlur: () => void;
  readonly onChange: (value: string) => void;
};

const SelectField = ({
  options,
  value,
  description,
  label,
  placeholder,
  errorMessage,
  onBlur,
  onChange,
}: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [currentValue, setCurrentValue] = useState(
    options.find((option) => option.value === value)?.label ?? ''
  );

  return (
    <div ref={ref} className={styles.select}>
      <InputField
        readOnly
        label={label}
        description={description}
        placeholder={placeholder}
        isDanger={!!errorMessage}
        errorMessage={errorMessage}
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
    </div>
  );
};

export default SelectField;
