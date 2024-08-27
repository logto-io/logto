import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import { Fragment } from 'react';
import type { FieldPath, FieldValues } from 'react-hook-form';

import type { Props as PaginationProps } from '@/ds-components/Pagination';
import Pagination from '@/ds-components/Pagination';

import OverlayScrollbar from '../OverlayScrollbar';

import Skeleton from './Skeleton';
import TableEmptyWrapper from './TableEmptyWrapper';
import TableError from './TableError';
import styles from './index.module.scss';
import type { Column, RowGroup } from './types';

export type Props<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  /** The table data groups of the table. */
  readonly rowGroups: Array<RowGroup<TFieldValues>>;
  /** The table's column definitions. */
  readonly columns: Array<Column<TFieldValues>>;
  /**
   * The key of the table row.
   * It will be used as the unique identifier of the row data and is indexed by the field name of the data from the row group.
   */
  readonly rowIndexKey: TName;
  /** The filter component that will be rendered on the top of the table. */
  readonly filter?: ReactNode;
  /** Determines whether the row has a hover effect or not. */
  readonly isRowHoverEffectDisabled?: boolean;
  /** The function to determine whether the row is clickable or not. */
  readonly isRowClickable?: (row: TFieldValues) => boolean;
  /** The function to handle the row click event. */
  readonly rowClickHandler?: (row: TFieldValues) => void;
  /** The function to customize the CSS className for the row. */
  readonly rowClassName?: (row: TFieldValues, index: number) => string | undefined;
  /** The CSS className for the table container. */
  readonly className?: string;
  /** The CSS className for the header table. */
  readonly headerTableClassName?: string;
  /** The CSS className for the body table wrapper. */
  readonly bodyTableWrapperClassName?: string;
  /**
   * Determines whether the table is in the loading state or not.
   * When the table is in the loading state, it will render the loading skeleton which is provided by the `loadingSkeleton` prop.
   */
  readonly isLoading?: boolean;
  /**
   * The pagination component props.
   * If it's provided, the pagination component will be rendered on the bottom-right of the table.
   */
  readonly pagination?: PaginationProps;
  /** The placeholder that will be rendered in the table when the table is empty. */
  readonly placeholder?: ReactNode;
  /** The loading skeleton that will be rendered in the table when the table is in the loading state. */
  readonly loadingSkeleton?: ReactNode;
  /**
   * The error message that will be rendered in the table when the table has an error.
   * If it's provided, the table will render the error message instead of the table data.
   */
  readonly errorMessage?: string;
  /** The inline style table that is usually embedded in other card containers, has rounded-corner border */
  readonly hasBorder?: boolean;
  /**
   * The retry button handler for the table.
   * When the table has an error, there will be a retry button inside the table, this handler will be called when the retry button is clicked.
   */
  readonly onRetry?: () => void;
  /** A footer that will be rendered on the bottom-left of the table. */
  readonly footer?: ReactNode;
};

function Table<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  rowGroups,
  columns,
  rowIndexKey,
  filter,
  isRowHoverEffectDisabled = false,
  rowClickHandler,
  isRowClickable = () => Boolean(rowClickHandler),
  rowClassName,
  className,
  headerTableClassName,
  bodyTableWrapperClassName,
  isLoading,
  pagination,
  placeholder,
  loadingSkeleton,
  errorMessage,
  hasBorder,
  onRetry,
  footer,
}: Props<TFieldValues, TName>) {
  const totalColspan = columns.reduce((result, { colSpan }) => {
    return result + (colSpan ?? 1);
  }, 0);

  const hasData = rowGroups.some(({ data }) => data?.length);
  const hasError = !isLoading && !hasData && errorMessage;
  const isEmpty = !isLoading && !hasData && !errorMessage;
  const isLoaded = !isLoading && hasData;

  return (
    <div className={classNames(styles.container, className)}>
      <div className={classNames(styles.tableContainer, hasBorder && styles.hasBorder)}>
        {filter && (
          <div className={styles.filterContainer}>
            <div className={styles.filter}>{filter}</div>
          </div>
        )}
        <table
          className={classNames(
            styles.headerTable,
            filter && styles.hideTopBorderRadius,
            headerTableClassName
          )}
        >
          <thead>
            <tr>
              {columns.map(({ title, colSpan, dataIndex }) => (
                <th key={dataIndex} colSpan={colSpan}>
                  {title}
                </th>
              ))}
            </tr>
          </thead>
        </table>
        <OverlayScrollbar
          className={classNames(
            styles.bodyTable,
            isEmpty && styles.empty,
            bodyTableWrapperClassName
          )}
        >
          <table>
            <tbody>
              {isLoading &&
                (loadingSkeleton ?? (
                  <Skeleton
                    isCompact={hasBorder}
                    columnSpans={columns.map(({ colSpan }) => colSpan ?? 1)}
                  />
                ))}
              {hasError && (
                <TableError columns={columns.length} content={errorMessage} onRetry={onRetry} />
              )}
              {isEmpty && (
                <TableEmptyWrapper columns={columns.length}>{placeholder}</TableEmptyWrapper>
              )}
              {isLoaded &&
                rowGroups.map(({ key, label, labelRowClassName, labelClassName, data }) => (
                  <Fragment key={key}>
                    {label && (
                      <tr className={labelRowClassName}>
                        <td colSpan={totalColspan} className={labelClassName}>
                          {label}
                        </td>
                      </tr>
                    )}
                    {data?.map((row, rowIndex) => {
                      const rowClickable = isRowClickable(row);

                      const onClick = conditional(
                        rowClickable &&
                          rowClickHandler &&
                          (() => {
                            rowClickHandler(row);
                          })
                      );

                      return (
                        <tr
                          key={row[rowIndexKey]}
                          className={classNames(
                            rowClickable && styles.clickable,
                            !isRowHoverEffectDisabled && styles.hoverEffect,
                            rowClassName?.(row, rowIndex)
                          )}
                          onClick={onClick}
                        >
                          {columns.map(({ dataIndex, colSpan, className, render }) => (
                            <td key={dataIndex} colSpan={colSpan} className={className}>
                              {render(row, rowIndex)}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </Fragment>
                ))}
            </tbody>
          </table>
        </OverlayScrollbar>
      </div>
      <div className={styles.footer}>
        {/* Fall back to a div if footer is not provided to avoid layout shift. */}
        {footer ?? <div />}
        {pagination && <Pagination className={styles.pagination} {...pagination} />}
      </div>
    </div>
  );
}

export default Table;
