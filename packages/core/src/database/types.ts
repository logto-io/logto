import { SchemaLike } from '@logto/schemas';
import { IdentifierSqlTokenType } from 'slonik';

export type Table = { table: string; fields: Record<string, string> };
export type FieldIdentifiers<Key extends string | number | symbol> = {
  [key in Key]: IdentifierSqlTokenType;
};

export type FindManyData<Schema extends SchemaLike> = {
  where?: Partial<Schema>;
  limit?: number;
  offset?: number;
};

export type UpdateWhereData<Schema extends SchemaLike> = {
  set: Partial<Schema>;
  where: Partial<Schema>;
};
