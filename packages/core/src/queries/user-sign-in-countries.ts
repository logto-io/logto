import { type UserSignInCountry, UserSignInCountries } from '@logto/schemas';
import { type CommonQueryMethods, sql } from '@silverhand/slonik';

import { convertToIdentifiers } from '#src/utils/sql.js';

const { table, fields } = convertToIdentifiers(UserSignInCountries);

export const createUserSignInCountriesQueries = (pool: CommonQueryMethods) => {
  const upsertUserSignInCountry = async (userId: string, country?: string) => {
    if (!country) {
      return;
    }

    await pool.query(sql`
      insert into ${table} (${fields.userId}, ${fields.country}, ${fields.lastSignInAt})
      values (${userId}, ${country}, now())
      on conflict (${fields.tenantId}, ${fields.userId}, ${fields.country})
      do update set ${fields.lastSignInAt} = now()
    `);
  };

  const findRecentSignInCountriesByUserId = async (userId: string, withinDays: number) => {
    const rows = await pool.any<Pick<UserSignInCountry, 'country'>>(sql`
      select ${fields.country}
      from ${table}
      where ${fields.userId} = ${userId}
        and ${fields.lastSignInAt} >= now() - ${withinDays} * interval '1 day'
      order by ${fields.lastSignInAt} desc
    `);

    return rows.map(({ country }) => country);
  };

  const pruneUserSignInCountriesByUserId = async (userId: string, retentionDays: number) => {
    await pool.query(sql`
      delete from ${table}
      where ${fields.userId} = ${userId}
        and ${fields.lastSignInAt} < now() - ${retentionDays} * interval '1 day'
    `);
  };

  return {
    upsertUserSignInCountry,
    findRecentSignInCountriesByUserId,
    pruneUserSignInCountriesByUserId,
  };
};
