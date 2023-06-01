import { type SystemKey, Systems } from '@logto/schemas';
import { convertToIdentifiers } from '@logto/shared';
import type { CommonQueryMethods } from 'slonik';
import { sql } from 'slonik';

const { table, fields } = convertToIdentifiers(Systems);

export const createSystemsQuery = (pool: CommonQueryMethods) => {
  const findSystemByKey = async (key: SystemKey) =>
    pool.maybeOne<Record<string, unknown>>(sql`
      select ${fields.value} from ${table}
      where ${fields.key} = ${key}
    `);

  return {
    findSystemByKey,
  };
};
