import { PasscodeType, Passcode, Passcodes, CreatePasscode } from '@logto/schemas';
import { sql } from 'slonik';

import { buildInsertInto } from '@/database/insert-into';
import pool from '@/database/pool';
import { buildUpdateWhere } from '@/database/update-where';
import { convertToIdentifiers } from '@/database/utils';
import { DeletionError } from '@/errors/SlonikError';

const { table, fields } = convertToIdentifiers(Passcodes);

export const findUnconsumedPasscodeBySessionIdAndType = async (
  sessionId: string,
  type: PasscodeType
) =>
  pool.one<Passcode>(sql`
    select ${sql.join(Object.values(fields), sql`, `)}
    from ${table}
    where ${fields.sessionId}=${sessionId} and ${fields.type}=${type} and ${fields.consumed} = false
  `);

export const findUnconsumedPasscodesBySessionIdAndType = async (
  sessionId: string,
  type: PasscodeType
) =>
  pool.many<Passcode>(sql`
    select ${sql.join(Object.values(fields), sql`, `)}
    from ${table}
    where ${fields.sessionId}=${sessionId} and ${fields.type}=${type} and ${fields.consumed} = false
  `);

export const insertPasscode = buildInsertInto<CreatePasscode, Passcode>(pool, Passcodes, {
  returning: true,
});

export const updatePasscode = buildUpdateWhere<CreatePasscode, Passcode>(pool, Passcodes, true);

export const deletePasscodeById = async (id: string) => {
  const { rowCount } = await pool.query(sql`
    delete from ${table}
    where id=${id}
  `);
  if (rowCount < 1) {
    throw new DeletionError();
  }
};

export const deletePasscodesByIds = async (ids: string[]) => {
  const { rowCount } = await pool.query(sql`
    delete from ${table}
    where id in (${ids.join(',')})
  `);
  if (rowCount < 1) {
    throw new DeletionError();
  }
};
