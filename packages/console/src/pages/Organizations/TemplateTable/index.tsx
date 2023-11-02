import { type FieldValues, type FieldPath } from 'react-hook-form';

import CirclePlus from '@/assets/icons/circle-plus.svg';
import Plus from '@/assets/icons/plus.svg';
import EmptyDataPlaceholder from '@/components/EmptyDataPlaceholder';
import Button from '@/ds-components/Button';
import { Ring as Spinner } from '@/ds-components/Spinner';
import Table from '@/ds-components/Table';
import { type Column } from '@/ds-components/Table/types';

import * as styles from './index.module.scss';

type Props<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>> = {
  rowIndexKey: TName;
  data: TFieldValues[];
  columns: Array<Column<TFieldValues>>;
  totalCount: number;
  page: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onAdd?: () => void;
};

export const pageSize = 10;

/**
 * The table component for organization template editing, such as permissions and roles.
 * If `onAdd` is provided, an add button will be rendered in the bottom.
 */
function TemplateTable<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  rowIndexKey,
  data,
  columns,
  onAdd,
  totalCount,
  page,
  isLoading,
  onPageChange,
}: Props<TFieldValues, TName>) {
  const hasData = !isLoading && data.length > 0;

  if (isLoading) {
    <Spinner className={styles.spinner} />;
  }

  return (
    <>
      {hasData && (
        <Table
          hasBorder
          placeholder={<EmptyDataPlaceholder />}
          isLoading={isLoading}
          rowGroups={[
            {
              key: 'data',
              data,
            },
          ]}
          columns={columns}
          rowIndexKey={rowIndexKey}
          pagination={{
            page,
            totalCount,
            pageSize,
            onChange: onPageChange,
          }}
          footer={
            <Button
              size="small"
              type="text"
              className={styles.addButton}
              icon={<CirclePlus />}
              title="general.create_another"
              onClick={onAdd}
            />
          }
        />
      )}
      {onAdd && !hasData && (
        <Button
          className={styles.addButton}
          icon={<Plus />}
          title="general.create"
          onClick={onAdd}
        />
      )}
    </>
  );
}

export default TemplateTable;
