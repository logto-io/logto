import { type AdminConsoleKey } from '@logto/phrases';
import classNames from 'classnames';

import DynamicT from '@/ds-components/DynamicT';

import Checkbox from '../Checkbox';

import * as styles from './index.module.scss';

type Option<T> = {
  title: AdminConsoleKey;
  value: T;
};

type Props<T> = {
  options: Array<Option<T>>;
  value: T[];
  onChange: (value: T[]) => void;
  className?: string;
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
      {options.map(({ title, value }) => (
        <Checkbox
          key={value}
          label={<DynamicT forKey={title} />}
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
