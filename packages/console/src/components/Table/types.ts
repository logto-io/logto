import type { Key, ReactNode } from 'react';
import type { FieldPath, FieldPathValue, FieldValues } from 'react-hook-form';

export type Column<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  title: ReactNode;
  dataIndex: TName;
  render: (value: FieldPathValue<TFieldValues, TName>, row: TFieldValues) => ReactNode;
  colSpan?: number;
  className?: string;
};

export type RowGroup<TFieldValues extends FieldValues = FieldValues> = {
  key: Key;
  label?: ReactNode;
  labelClassName?: string;
  data?: TFieldValues[];
};
