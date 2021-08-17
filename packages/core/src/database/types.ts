import { IdentifierSqlTokenType } from 'slonik';

export type Table = { table: string; fields: Record<string, string> };
export type FieldIdentifiers<Key extends string | number | symbol> = {
  [key in Key]: IdentifierSqlTokenType;
};
