import { type UserCountryVisit, UserCountryVisits } from '@logto/schemas';
import { type CommonQueryMethods, sql } from '@silverhand/slonik';

import { convertToIdentifiers } from '#src/utils/sql.js';

const { table, fields } = convertToIdentifiers(UserCountryVisits);

export const createUserCountryVisitsQueries = (pool: CommonQueryMethods) => {
  const upsertUserCountryVisit = async (userId: string, country?: string) => {
    if (!country) {
      return;
    }

    await pool.query(sql`
      insert into ${table} (${fields.userId}, ${fields.country}, ${fields.visitedAt})
      values (${userId}, ${country}, now())
      on conflict (${fields.tenantId}, ${fields.userId}, ${fields.country})
      do update set ${fields.visitedAt} = now()
    `);
  };

  const findRecentCountryVisitsByUserId = async (userId: string, withinDays: number) => {
    const rows = await pool.any<Pick<UserCountryVisit, 'country'>>(sql`
      select ${fields.country}
      from ${table}
      where ${fields.userId} = ${userId}
        and ${fields.visitedAt} >= now() - ${withinDays} * interval '1 day'
      order by ${fields.visitedAt} desc
    `);

    return rows.map(({ country }) => country);
  };

  const pruneUserCountryVisitsByUserId = async (userId: string, retentionDays: number) => {
    await pool.query(sql`
      delete from ${table}
      where ${fields.userId} = ${userId}
        and ${fields.visitedAt} < now() - ${retentionDays} * interval '1 day'
    `);
  };

  return {
    upsertUserCountryVisit,
    findRecentCountryVisitsByUserId,
    pruneUserCountryVisitsByUserId,
  };
};
