import classNames from 'classnames';

import type { MultiCardSelectorOption } from '../types';

import CardItem from './CardItem';
import styles from './index.module.scss';

type Props = {
  readonly options: MultiCardSelectorOption[];
  readonly value: string[];
  readonly onChange: (value: string[]) => void;
  readonly isNotAllowEmpty?: boolean;
  readonly className?: string;
  readonly optionClassName?: string;
};

function MultiCardSelector({
  options,
  value: selectedValues,
  onChange,
  isNotAllowEmpty = false,
  className,
  optionClassName,
}: Props) {
  const onToggle = (value: string) => {
    if (selectedValues.includes(value) && selectedValues.length === 1 && isNotAllowEmpty) {
      return;
    }

    onChange(
      selectedValues.includes(value)
        ? selectedValues.filter((selected) => selected !== value)
        : [...selectedValues, value]
    );
  };

  return (
    <div className={classNames(styles.selector, className)}>
      {options.map((option) => (
        <CardItem
          key={option.value}
          option={option}
          isSelected={selectedValues.includes(option.value)}
          className={optionClassName}
          onClick={onToggle}
        />
      ))}
    </div>
  );
}

export default MultiCardSelector;
