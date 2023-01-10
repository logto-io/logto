import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import { Fragment } from 'react';
import type { FieldPath, FieldValues } from 'react-hook-form';

import type { Props as PaginationProps } from '@/components/Pagination';
import Pagination from '@/components/Pagination';

import TableEmpty from './TableEmpty';
import TableError from './TableError';
import TableLoading from './TableLoading';
import * as styles from './index.module.scss';
import type { Column, RowGroup } from './types';

export type TablePlaceholder = {
  title?: string;
  description?: string;
  image?: ReactNode;
  content?: ReactNode;
};

type Props<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  rowGroups: Array<RowGroup<TFieldValues>>;
  columns: Array<Column<TFieldValues>>;
  rowIndexKey: TName;
  filter?: ReactNode;
  isRowClickable?: (row: TFieldValues) => boolean;
  rowClickHandler?: (row: TFieldValues) => void;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  isLoading?: boolean;
  pagination?: PaginationProps;
  placeholder?: TablePlaceholder;
  errorMessage?: string;
  onRetry?: () => void;
};

const Table = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  rowGroups,
  columns,
  rowIndexKey,
  filter,
  rowClickHandler,
  isRowClickable = () => Boolean(rowClickHandler),
  className,
  headerClassName,
  bodyClassName,
  isLoading,
  pagination,
  placeholder,
  errorMessage,
  onRetry,
}: Props<TFieldValues, TName>) => {
  const totalColspan = columns.reduce((result, { colSpan }) => {
    return result + (colSpan ?? 1);
  }, 0);

  const hasData = rowGroups.some(({ data }) => data?.length);

  return (
    <div className={classNames(styles.container, className)}>
      <div className={styles.tableContainer}>
        {filter && (
          <div className={styles.filterContainer}>
            <div className={styles.filter}>{filter}</div>
          </div>
        )}
        <table
          className={classNames(
            styles.headerTable,
            filter && styles.hideTopBorderRadius,
            headerClassName
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
        <div className={classNames(styles.bodyTable, bodyClassName)}>
          <table>
            <tbody>
              {isLoading && <TableLoading columns={columns.length} />}
              {!hasData && errorMessage && (
                <TableError columns={columns.length} content={errorMessage} onRetry={onRetry} />
              )}
              {!isLoading && !hasData && placeholder && (
                <TableEmpty
                  columns={columns.length}
                  title={placeholder.title}
                  description={placeholder.description}
                  image={placeholder.image}
                >
                  {placeholder.content}
                </TableEmpty>
              )}
              {rowGroups.map(({ key, label, labelClassName, data }) => (
                <Fragment key={key}>
                  {label && (
                    <tr>
                      <td colSpan={totalColspan} className={labelClassName}>
                        {label}
                      </td>
                    </tr>
                  )}
                  {data?.map((row) => {
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
                        className={classNames(rowClickable && styles.clickable)}
                        onClick={onClick}
                      >
                        {columns.map(({ dataIndex, colSpan, className, render }) => (
                          <td key={dataIndex} colSpan={colSpan} className={className}>
                            {render(row)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {pagination && <Pagination className={styles.pagination} {...pagination} />}
    </div>
  );
};

export default Table;
