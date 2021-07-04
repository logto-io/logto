import pool from '@/database/pool';
import { convertToIdentifiers } from '@/database/utils';
import { OidcClientDBEntry, OidcClients } from '@logto/schemas';
import { sql } from 'slonik';

const { table, fields } = convertToIdentifiers(OidcClients);

export const findClientById = async (clientId: string) =>
  pool.one<OidcClientDBEntry>(sql`
  select ${sql.join(Object.values(fields), sql`, `)}
  from ${table}
  where ${fields.clientId}=${clientId}
`);
