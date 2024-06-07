import { type AdminConsoleKey } from '@logto/phrases';
import classNames from 'classnames';

import DynamicT from '@/ds-components/DynamicT';

import CheckboxGroup, { type Option } from '../CheckboxGroup';

import * as styles from './index.module.scss';

export type CheckboxOptionGroup<T> = {
  title: AdminConsoleKey;
  options: Array<Option<T>>;
};

type Props<T> = {
  readonly groups: Array<CheckboxOptionGroup<T>>;
  readonly value: T[];
  readonly onChange: (value: T[]) => void;
  readonly className?: string;
};

function CategorizedCheckboxGroup<T extends string>({
  groups,
  value: checkedValues,
  onChange,
  className,
}: Props<T>) {
  return (
    <div className={classNames(styles.groupList, className)}>
      {groups.map(({ title, options }) => (
        <div key={title}>
          <div className={styles.groupTitle}>
            <DynamicT forKey={title} />
          </div>
          <CheckboxGroup options={options} value={checkedValues} onChange={onChange} />
        </div>
      ))}
    </div>
  );
}

export default CategorizedCheckboxGroup;
