import { type AdminConsoleKey } from '@logto/phrases';
import { useMemo } from 'react';
import { type FieldPath, type FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import CirclePlus from '@/assets/icons/circle-plus.svg?react';
import Plus from '@/assets/icons/plus.svg?react';
import Button from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';
import Table from '@/ds-components/Table';
import { type RowGroup, type Column } from '@/ds-components/Table/types';

import styles from './index.module.scss';

type Props<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>> = {
  /**
   * The optional table name. The value must be a valid phrase singular key with plural support.
   */
  readonly name?: AdminConsoleKey;
  readonly className?: string;
  readonly rowIndexKey: TName;
  readonly rowGroups: Array<RowGroup<TFieldValues>>;
  readonly columns: Array<Column<TFieldValues>>;
  readonly pagination?: {
    page: number;
    totalCount: number;
    onChange: (page: number) => void;
  };
  readonly isLoading?: boolean;
  readonly onAdd?: () => void;
  readonly errorMessage?: string;
};

const pageSize = 10;

/**
 * The table component for organization template editing, such as permissions and roles.
 * If `onAdd` is provided, an add button will be rendered in the bottom.
 */
function TemplateTable<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  className,
  rowIndexKey,
  rowGroups,
  columns,
  pagination,
  isLoading,
  onAdd,
  errorMessage,
}: Props<TFieldValues, TName>) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  // If there is no data for all row groups, we will render an empty state with an add button.
  const noData = !isLoading && !rowGroups.some(({ data }) => data && data.length > 0);

  const tablePagination = useMemo(() => pagination && { ...pagination, pageSize }, [pagination]);

  return (
    <section className={styles.section}>
      {name && (
        <header className={styles.title}>
          <DynamicT forKey={name} interpolation={{ count: 2 }} />
        </header>
      )}
      {onAdd && noData && !errorMessage && (
        <>
          {name && (
            <div className={styles.empty}>
              {t('organizations.empty_placeholder', { entity: String(t(name)).toLowerCase() })}
            </div>
          )}
          <Button icon={<Plus />} title="general.add" onClick={onAdd} />
        </>
      )}
      {noData && errorMessage && <div className={styles.empty}>{errorMessage}</div>}
      {!noData && (
        <Table
          hasBorder
          isRowHoverEffectDisabled
          className={className}
          isLoading={isLoading}
          rowGroups={rowGroups}
          columns={columns}
          rowIndexKey={rowIndexKey}
          pagination={tablePagination}
          footer={
            <Button
              size="small"
              type="text"
              className={styles.addAnother}
              icon={<CirclePlus />}
              title="general.add_another"
              onClick={onAdd}
            />
          }
        />
      )}
    </section>
  );
}

export default TemplateTable;
