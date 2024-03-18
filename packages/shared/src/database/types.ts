export type SchemaValuePrimitive = string | number | boolean | undefined;
export type SchemaValue = SchemaValuePrimitive | Record<string, unknown> | unknown[] | null;
export type SchemaLike<Key extends string> = {
  [key in Key]: SchemaValue;
};

export type Table<Keys extends string, TableName extends string = string> = {
  table: TableName;
  fields: Record<Keys, string>;
};

export type OrderDirection = 'asc' | 'desc';

export type UpdateWhereData<SetKey extends string, WhereKey extends string> = {
  set: Partial<SchemaLike<SetKey>>;
  where: Partial<SchemaLike<WhereKey>>;
  jsonbMode: 'replace' | 'merge';
};
