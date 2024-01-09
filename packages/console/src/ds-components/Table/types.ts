import type { Key, ReactNode } from 'react';
import type { FieldValues } from 'react-hook-form';

export type Column<TFieldValues extends FieldValues = FieldValues> = {
  title: ReactNode;
  dataIndex: string;
  render: (row: TFieldValues, rowIndex: number) => ReactNode;
  colSpan?: number;
  className?: string;
};

export type RowGroup<TFieldValues extends FieldValues = FieldValues> = {
  key: Key;
  label?: ReactNode;
  labelRowClassName?: string;
  labelClassName?: string;
  data?: TFieldValues[];
};
