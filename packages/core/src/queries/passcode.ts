import type { PasscodeType, Passcode, CreatePasscode } from '@logto/schemas';
import { Passcodes } from '@logto/schemas';
import { convertToIdentifiers } from '@logto/shared';
import { sql } from 'slonik';

import { buildInsertInto } from '#src/database/insert-into.js';
import envSet from '#src/env-set/index.js';
import { DeletionError } from '#src/errors/SlonikError/index.js';

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

export const consumePasscode = async (id: string) =>
  envSet.pool.query<Passcode>(sql`
    update ${table}
    set ${fields.consumed}=true
    where ${fields.id}=${id}
    returning ${sql.join(Object.values(fields), sql`, `)}
  `);

export const increasePasscodeTryCount = async (id: string) =>
  envSet.pool.query<Passcode>(sql`
    update ${table}
    set ${fields.tryCount}=${fields.tryCount}+1
    where ${fields.id}=${id}
    returning ${sql.join(Object.values(fields), sql`, `)}
  `);

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
    where ${fields.id} in (${sql.join(ids, sql`,`)})
  `);

  if (rowCount !== ids.length) {
    throw new DeletionError(Passcodes.table, `${ids.join(',')}`);
  }
};
