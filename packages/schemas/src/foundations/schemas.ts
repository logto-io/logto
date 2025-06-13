import { type SchemaLike } from '@logto/shared/universal';
import type { ZodObject, ZodType, ZodOptional, ZodTypeAny } from 'zod';

export type { SchemaLike, SchemaValue, SchemaValuePrimitive } from '@logto/shared/universal';

type ParseOptional<K> = undefined extends K
  ? ZodOptional<ZodType<Exclude<K, undefined>>>
  : ZodType<K>;

export type Guard<T extends SchemaLike<string>> = ZodObject<
  {
    [key in keyof T]-?: ParseOptional<T[key]>;
  },
  'strip',
  ZodTypeAny,
  T,
  T
>;

export type GeneratedSchema<
  Key extends string,
  CreateSchema extends Partial<SchemaLike<Key>>,
  Schema extends SchemaLike<Key>,
  Table extends string = string,
  TableSingular extends string = string,
  View extends string = string,
> = Readonly<{
  table: Table;
  tableSingular: TableSingular;
  fields: {
    [key in Key]: string;
  };
  /**
   * The view name for the schema.
   * If not specified, the view name will be the same as the table name.
   */
  view: View;
  fieldKeys: readonly Key[];
  createGuard: Guard<CreateSchema>;
  guard: Guard<Schema>;
  updateGuard: Guard<Partial<Schema>>;
}>;
