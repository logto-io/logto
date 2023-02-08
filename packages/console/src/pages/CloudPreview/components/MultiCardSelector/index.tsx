import classNames from 'classnames';
import type { ReactNode } from 'react';

import { onKeyDownHandler } from '@/utilities/a11y';

import * as styles from './index.module.scss';

type Option = {
  title: ReactNode;
  value: string;
};

type Props = {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
};

const MultiCardSelector = ({ options, value: selectedValues, onChange }: Props) => {
  const onToggle = (value: string) => {
    onChange(
      selectedValues.includes(value)
        ? selectedValues.filter((selected) => selected !== value)
        : [...selectedValues, value]
    );
  };

  return (
    <div className={styles.selector}>
      {options.map((option) => (
        <div
          key={option.value}
          role="button"
          tabIndex={0}
          className={classNames(
            styles.option,
            selectedValues.includes(option.value) && styles.selected
          )}
          onClick={() => {
            onToggle(option.value);
          }}
          onKeyDown={onKeyDownHandler(() => {
            onToggle(option.value);
          })}
        >
          {option.title}
        </div>
      ))}
    </div>
  );
};

export default MultiCardSelector;
