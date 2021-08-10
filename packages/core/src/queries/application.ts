import pool from '@/database/pool';
import { convertToIdentifiers } from '@/database/utils';
import { ApplicationDBEntry, Applications } from '@logto/schemas';
import { sql } from 'slonik';

const { table, fields } = convertToIdentifiers(Applications);

export const findApplicationByClientId = async (clientId: string) =>
  pool.one<ApplicationDBEntry>(sql`
  select ${sql.join(Object.values(fields), sql`, `)}
  from ${table}
  where ${fields.oidcClientId}=${clientId}
`);
