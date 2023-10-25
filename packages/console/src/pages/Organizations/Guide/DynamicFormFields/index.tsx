import { type AdminConsoleKey } from '@logto/phrases';
import classNames from 'classnames';
import { type ReactNode } from 'react';

import CirclePlus from '@/assets/icons/circle-plus.svg';
import Minus from '@/assets/icons/minus.svg';
import Button from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';
import IconButton from '@/ds-components/IconButton';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  title?: AdminConsoleKey;
  fields: Array<Record<'id', string>>;
  isLoading?: boolean;
  onAdd: () => void;
  onRemove: (index: number) => void;
  render: (index: number) => ReactNode;
};

function Skeleton() {
  return (
    <div className={styles.skeleton}>
      {Array.from({ length: 2 }).map((_, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={index} className={styles.group}>
          <div className={styles.title} />
          <div className={styles.field} />
        </div>
      ))}
    </div>
  );
}

function DynamicFormFields({
  className,
  title,
  fields,
  isLoading,
  onAdd,
  onRemove,
  render,
}: Props) {
  return (
    <div className={classNames(styles.formContainer, className)}>
      {title && (
        <div className={styles.title}>
          <DynamicT forKey={title} />
        </div>
      )}
      {fields.map((field, index) => (
        <div key={field.id} className={styles.item}>
          {isLoading ? <Skeleton /> : <div className={styles.fieldWrapper}>{render(index)}</div>}
          {fields.length > 1 && (
            <IconButton
              size="small"
              onClick={() => {
                onRemove(index);
              }}
            >
              <Minus />
            </IconButton>
          )}
        </div>
      ))}
      {!isLoading && (
        <Button
          size="small"
          type="text"
          title="general.add_another"
          icon={<CirclePlus />}
          onClick={() => {
            onAdd();
          }}
        />
      )}
    </div>
  );
}

export default DynamicFormFields;
