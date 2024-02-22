import type { Key, ReactNode } from 'react';
import type { FieldValues } from 'react-hook-form';

export type Column<TFieldValues extends FieldValues = FieldValues> = {
  /** The title of the column. It will be rendered as the column name of the table column. */
  title: ReactNode;
  /** The key of the data for the table data cell in the column. It will be used as the unique identifier. */
  dataIndex: string;
  /**
   * The render function of the table data cell in the column. It will be used to render the content of the cell by the row data.
   * @param row the row data
   * @param rowIndex the index of the row data in the row group
   * @returns the content of the cell
   */
  render: (row: TFieldValues, rowIndex: number) => ReactNode;
  /**
   * The column span value for the table data cell of the column.
   * This value is used to control the width of the column.
   */
  colSpan?: number;
  /** The CSS className for the rendered table data cell in the column. */
  className?: string;
};

/**
 * Table row group
 *
 * Table row data needs in a grouped, and will be rendered as a separate section in the table.
 * If the row data group has a label, the label it will be rendered as the title of the section.
 */
export type RowGroup<TFieldValues extends FieldValues = FieldValues> = {
  /**
   * The key of the row group. It will be used as the unique identifier of the row group.
   */
  key: Key;
  /**
   * The label of the group. It's the title of the group section if it's provided, and will be rendered a separate row in the table.
   * ```jsx
   * <tr>
   *   <td>
   *     {label}
   *   </td>
   * </tr>
   * ```
   */
  label?: ReactNode;
  /**
   * The CSS className for the separate group label row.
   * ```jsx
   * <tr className={labelRowClassName}>
   *   <td className={labelClassName}>
   *     {label}
   *   </td>
   * </tr>
   * ```
   */
  labelRowClassName?: string;
  /**
   * The CSS className for the label content.
   * ```jsx
   * <tr className={labelRowClassName}>
   *   <td className={labelClassName}>
   *     {label}
   *   </td>
   * </tr>
   * ```
   */
  labelClassName?: string;
  data?: TFieldValues[];
};
