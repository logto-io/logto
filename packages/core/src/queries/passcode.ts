import { PasscodeType, Passcode, Passcodes, CreatePasscode } from '@logto/schemas';
import { sql } from 'slonik';

import { buildInsertInto } from '@/database/insert-into';
import pool from '@/database/pool';
import { buildUpdateWhere } from '@/database/update-where';
import { convertToIdentifiers } from '@/database/utils';

const { table, fields } = convertToIdentifiers(Passcodes);

export const findUnusedPasscodeBySessionIdAndType = async (sessionId: string, type: PasscodeType) =>
  pool.one<Passcode>(sql`
    select ${sql.join(Object.values(fields), sql`, `)}
    from ${table}
    where ${fields.sessionId}=${sessionId} and ${fields.type}=${type} and ${fields.used} = false
  `);

export const insertPasscode = buildInsertInto<CreatePasscode, Passcode>(pool, Passcodes, {
  returning: true,
});

export const updatePasscode = buildUpdateWhere<CreatePasscode, Passcode>(pool, Passcodes, true);
