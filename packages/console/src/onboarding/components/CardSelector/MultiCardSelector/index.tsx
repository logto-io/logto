import classNames from 'classnames';

import CardItem from './CardItem';
import * as styles from './index.module.scss';
import type { MultiCardSelectorOption } from '../types';

type Props = {
  options: MultiCardSelectorOption[];
  value: string[];
  onChange: (value: string[]) => void;
  isNotAllowEmpty?: boolean;
  className?: string;
  optionClassName?: string;
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
