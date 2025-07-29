import { type Nullable } from '@silverhand/essentials';
import classNames from 'classnames';

import Checkbox from '../Checkbox';

import styles from './index.module.scss';

export type Option<T> = {
  title?: string;
  value: T;
};

type Props<T> = {
  readonly options: Array<Option<T>>;
  readonly value: T[];
  readonly className?: string;
  readonly description?: Nullable<string>;
  readonly errorMessage?: string;
  readonly onChange: (value: T[]) => void;
};

const CheckboxGroup = <T extends string>({
  options,
  value: checkedValues,
  className,
  description,
  errorMessage,
  onChange,
}: Props<T>) => {
  const toggleValue = (value: T) => {
    onChange(
      checkedValues.includes(value)
        ? checkedValues.filter((selected) => selected !== value)
        : [...checkedValues, value]
    );
  };

  return (
    <>
      <div className={classNames(styles.group, className)}>
        {options.map(({ title, value }) => (
          <Checkbox
            key={value}
            title={title ?? value}
            checked={checkedValues.includes(value)}
            onChange={() => {
              toggleValue(value);
            }}
          />
        ))}
      </div>
      {description && <div className={styles.description}>{description}</div>}
      {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
    </>
  );
};

export default CheckboxGroup;
