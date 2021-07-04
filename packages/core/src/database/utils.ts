import { IdentifierSqlTokenType, sql } from 'slonik';

type Table = { table: string; fields: Record<string, string> };
type FieldIdentifiers<Key extends string | number | symbol> = {
  [key in Key]: IdentifierSqlTokenType;
};

const convertToPrimitive = <T>(value: T) =>
  value !== null && typeof value === 'object' ? JSON.stringify(value) : value;

export const convertToIdentifiers = <T extends Table>(
  { table, fields }: T,
  withPrefix = false
) => ({
  table: sql.identifier([table]),
  fields: Object.entries<string>(fields).reduce(
    (previous, [key, value]) => ({
      ...previous,
      [key]: sql.identifier(withPrefix ? [table, value] : [value]),
    }),
    // eslint-disable-next-line @typescript-eslint/prefer-reduce-type-parameter
    {} as FieldIdentifiers<keyof T['fields']>
  ),
});

export const insertInto = <Type, Key extends keyof Type = keyof Type>(
  table: IdentifierSqlTokenType,
  fields: FieldIdentifiers<Key>,
  fieldKeys: readonly Key[],
  value: { [key in Key]?: Type[key] }
) => sql`
  insert into ${table} (${sql.join(
  fieldKeys.map((key) => fields[key]),
  sql`, `
)})
  values (${sql.join(
    fieldKeys.map((key) => convertToPrimitive(value[key] ?? null)),
    sql`, `
  )})`;

export const setExcluded = (...fields: IdentifierSqlTokenType[]) =>
  sql.join(
    fields.map((field) => sql`${field}=excluded.${field}`),
    sql`, `
  );
