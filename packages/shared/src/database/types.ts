import type { IdentifierSqlToken } from 'slonik';

export type SchemaValuePrimitive = string | number | boolean;
export type SchemaValue =
  | SchemaValuePrimitive
  | SchemaValuePrimitive[]
  | Record<string, unknown>
  | null
  | undefined;
export type SchemaLike<Key extends string = string> = {
  [key in Key]: SchemaValue;
};

export type Table = { table: string; fields: Record<string, string> };
export type FieldIdentifiers<Key extends string | number | symbol> = {
  [key in Key]: IdentifierSqlToken;
};

export type OrderDirection = 'asc' | 'desc';

export type OrderBy<Schema extends SchemaLike> = Partial<Record<keyof Schema, OrderDirection>>;

export type FindManyData<Schema extends SchemaLike> = {
  where?: Partial<Schema>;
  orderBy?: OrderBy<Schema>;
  limit?: number;
  offset?: number;
};

export type UpdateWhereData<Schema extends SchemaLike> = {
  set: Partial<Schema>;
  where: Partial<Schema>;
  jsonbMode: 'replace' | 'merge';
};
