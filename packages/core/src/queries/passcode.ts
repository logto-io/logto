import { PasscodeType, Passcode, Passcodes, CreatePasscode } from '@logto/schemas';
import { sql } from 'slonik';

import { buildInsertInto } from '@/database/insert-into';
import { buildUpdateWhere } from '@/database/update-where';
import { convertToIdentifiers } from '@/database/utils';
import envSet from '@/env-set';
import { DeletionError } from '@/errors/SlonikError';

const { table, fields } = convertToIdentifiers(Passcodes);

export const findUnconsumedPasscodeByJtiAndType = async (jti: string, type: PasscodeType) =>
  envSet.pool.maybeOne<Passcode>(sql`
    select ${sql.join(Object.values(fields), sql`, `)}
    from ${table}
    where ${fields.interactionJti}=${jti} and ${fields.type}=${type} and ${fields.consumed} = false
  `);

export const findUnconsumedPasscodesByJtiAndType = async (jti: string, type: PasscodeType) =>
  envSet.pool.any<Passcode>(sql`
    select ${sql.join(Object.values(fields), sql`, `)}
    from ${table}
    where ${fields.interactionJti}=${jti} and ${fields.type}=${type} and ${fields.consumed} = false
  `);

export const insertPasscode = buildInsertInto<CreatePasscode, Passcode>(Passcodes, {
  returning: true,
});

export const updatePasscode = buildUpdateWhere<CreatePasscode, Passcode>(Passcodes, true);

export const deletePasscodeById = async (id: string) => {
  const { rowCount } = await envSet.pool.query(sql`
    delete from ${table}
    where ${fields.id}=${id}
  `);

  if (rowCount < 1) {
    throw new DeletionError(Passcodes.table, id);
  }
};

export const deletePasscodesByIds = async (ids: string[]) => {
  const { rowCount } = await envSet.pool.query(sql`
    delete from ${table}
    where ${fields.id} in (${ids.join(',')})
  `);

  if (rowCount !== ids.length) {
    // TODO: need to track the failed ids
    throw new DeletionError(Passcodes.table, `${ids.join(',')}`);
  }
};
