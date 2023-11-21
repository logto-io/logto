import { type AdminConsoleKey } from '@logto/phrases';
import { type FieldValues, type FieldPath } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import CirclePlus from '@/assets/icons/circle-plus.svg';
import Plus from '@/assets/icons/plus.svg';
import Button from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';
import Table from '@/ds-components/Table';
import { type Column } from '@/ds-components/Table/types';

import * as styles from './index.module.scss';

type Props<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>> = {
  /**
   * The optional table name. The value must be a valid phrase singular key with plural support.
   */
  name?: AdminConsoleKey;
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
  name,
  rowIndexKey,
  data,
  columns,
  onAdd,
  totalCount,
  page,
  isLoading,
  onPageChange,
}: Props<TFieldValues, TName>) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const noData = !isLoading && data.length === 0;

  return (
    <section className={styles.section}>
      {name && (
        <header className={styles.title}>
          <DynamicT forKey={name} interpolation={{ count: 2 }} />
        </header>
      )}
      {onAdd && noData && (
        <>
          {name && (
            <div className={styles.empty}>
              {t('organizations.empty_placeholder', { entity: String(t(name)).toLowerCase() })}
            </div>
          )}
          <Button icon={<Plus />} title="general.add" onClick={onAdd} />
        </>
      )}
      {!noData && (
        <Table
          hasBorder
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
