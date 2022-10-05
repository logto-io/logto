import chalk from 'chalk';
import { createPool, IdentifierSqlToken, sql } from 'slonik';
import { createInterceptors } from 'slonik-interceptor-preset';

import { getConfig } from './config';
import { log } from './utilities';

export const createPoolFromConfig = async () => {
  const { databaseUrl } = await getConfig();

  if (!databaseUrl) {
    log.error(
      `No database URL configured. Set one via ${chalk.green('database set-url')} command first.`
    );
  }

  return createPool(databaseUrl, {
    interceptors: createInterceptors(),
  });
};

// TODO: Move database utils to `core-kit`
export type Table = { table: string; fields: Record<string, string> };
export type FieldIdentifiers<Key extends string | number | symbol> = {
  [key in Key]: IdentifierSqlToken;
};

export const convertToIdentifiers = <T extends Table>({ table, fields }: T, withPrefix = false) => {
  const fieldsIdentifiers = Object.entries<string>(fields).map<
    [keyof T['fields'], IdentifierSqlToken]
  >(([key, value]) => [key, sql.identifier(withPrefix ? [table, value] : [value])]);

  return {
    table: sql.identifier([table]),
    // Key value inferred from the original fields directly
    // eslint-disable-next-line no-restricted-syntax
    fields: Object.fromEntries(fieldsIdentifiers) as FieldIdentifiers<keyof T['fields']>,
  };
};
