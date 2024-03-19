import { DailyTokenUsage } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import type { CommonQueryMethods } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import { getUtcStartOfTheDay } from '#src/oidc/utils.js';
import { convertToIdentifiers } from '#src/utils/sql.js';

const { table, fields } = convertToIdentifiers(DailyTokenUsage);
const { fields: fieldsWithPrefix } = convertToIdentifiers(DailyTokenUsage, true);

export const createDailyTokenUsageQueries = (pool: CommonQueryMethods) => {
  /**
   * Record the token usage of the current date.
   *
   * @param date The current date.
   * @returns The updated token usage of the current date.
   */
  /**
   * We opted to manually write a query instead of using existing query building methods,
   * as the latter couldn't support the complexity of this specific query logic.
   *
   * If we were to use the pre-built query methods, completing this operation would
   * require two database requests:
   * 1. to request the record
   * 2. to update it if the record exists, or insert a new one if it doesn’t
   *
   * The approach we used allows us to accomplish the task within a single database query.
   */
  const recordTokenUsage = async (date: Date) =>
    // Insert a new record if not exists (with usage to be 1, since this
    // should be the first token use of the day), otherwise increment the usage by 1.
    pool.one<DailyTokenUsage>(sql`
      insert into ${table} (${fields.id}, ${fields.date}, ${fields.usage})
      values (${generateStandardId()}, to_timestamp(${getUtcStartOfTheDay(
        date
      ).getTime()}::double precision / 1000), 1)
      on conflict (${fields.date}, ${fields.tenantId}) do update set ${fields.usage} = ${
        fieldsWithPrefix.usage
      } + 1
      returning ${sql.join(Object.values(fields), sql`, `)}
    `);

  return {
    recordTokenUsage,
  };
};
