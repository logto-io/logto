import { type AdminConsoleKey } from '@logto/phrases';
import classNames from 'classnames';
import { type ReactNode } from 'react';

import DynamicT from '@/ds-components/DynamicT';

import Checkbox from '../Checkbox';

import styles from './index.module.scss';

export type Option<T> = {
  title?: AdminConsoleKey;
  tag?: ReactNode;
  value: T;
};

type Props<T> = {
  readonly options: Array<Option<T>>;
  readonly value: T[];
  readonly onChange: (value: T[]) => void;
  readonly className?: string;
};

function CheckboxGroup<T extends string>({
  options,
  value: checkedValues,
  onChange,
  className,
}: Props<T>) {
  const toggleValue = (value: T) => {
    onChange(
      checkedValues.includes(value)
        ? checkedValues.filter((selected) => selected !== value)
        : [...checkedValues, value]
    );
  };

  return (
    <div className={classNames(styles.group, className)}>
      {options.map(({ title, value, tag }) => (
        <Checkbox
          key={value}
          label={
            <>
              {title ? <DynamicT forKey={title} /> : value}
              {tag}
            </>
          }
          checked={checkedValues.includes(value)}
          onChange={() => {
            toggleValue(value);
          }}
        />
      ))}
    </div>
  );
}

export default CheckboxGroup;
