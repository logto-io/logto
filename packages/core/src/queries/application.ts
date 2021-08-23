import { buildInsertInto } from '@/database/insert';
import pool from '@/database/pool';
import { convertToIdentifiers } from '@/database/utils';
import RequestError from '@/errors/RequestError';
import { ApplicationDBEntry, Applications } from '@logto/schemas';
import { sql } from 'slonik';

const { table, fields } = convertToIdentifiers(Applications);

export const findApplicationById = async (id: string) =>
  pool.one<ApplicationDBEntry>(sql`
    select ${sql.join(Object.values(fields), sql`, `)}
    from ${table}
    where ${fields.id}=${id}
  `);

export const insertApplication = buildInsertInto<ApplicationDBEntry>(pool, Applications, {
  returning: true,
});

export const deleteApplicationById = async (id: string) => {
  const { rowCount } = await pool.query(sql`
    delete from ${table}
    where id=${id}
  `);
  if (rowCount < 1) {
    throw new RequestError({ code: 'entity.not_exists', name: Applications.tableSingular, id });
  }
};
