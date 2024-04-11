import { type SystemKey, Systems } from '@logto/schemas';
import type { CommonQueryMethods } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import { convertToIdentifiers } from '#src/utils/sql.js';

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
