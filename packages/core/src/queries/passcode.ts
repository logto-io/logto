import type { VerificationCodeType } from '@logto/connector-kit';
import type { Passcode, CreatePasscode } from '@logto/schemas';
import { Passcodes } from '@logto/schemas';
import { convertToIdentifiers } from '@logto/shared';
import type { CommonQueryMethods } from 'slonik';
import { sql } from 'slonik';

import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import envSet from '#src/env-set/index.js';
import { DeletionError } from '#src/errors/SlonikError/index.js';

const { table, fields } = convertToIdentifiers(Passcodes);

export const createPasscodeQueries = (pool: CommonQueryMethods) => {
  const findUnconsumedPasscodeByJtiAndType = async (jti: string, type: VerificationCodeType) =>
    pool.maybeOne<Passcode>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.interactionJti}=${jti} and ${fields.type}=${type} and ${
      fields.consumed
    } = false
    `);

  const findUnconsumedPasscodesByJtiAndType = async (jti: string, type: VerificationCodeType) =>
    pool.any<Passcode>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.interactionJti}=${jti} and ${fields.type}=${type} and ${
      fields.consumed
    } = false
    `);

  const insertPasscode = buildInsertIntoWithPool(pool)<CreatePasscode, Passcode>(Passcodes, {
    returning: true,
  });

  const consumePasscode = async (id: string) =>
    pool.query<Passcode>(sql`
      update ${table}
      set ${fields.consumed}=true
      where ${fields.id}=${id}
      returning ${sql.join(Object.values(fields), sql`, `)}
    `);

  const increasePasscodeTryCount = async (id: string) =>
    pool.query<Passcode>(sql`
      update ${table}
      set ${fields.tryCount}=${fields.tryCount}+1
      where ${fields.id}=${id}
      returning ${sql.join(Object.values(fields), sql`, `)}
    `);

  const deletePasscodeById = async (id: string) => {
    const { rowCount } = await pool.query(sql`
      delete from ${table}
      where ${fields.id}=${id}
    `);

    if (rowCount < 1) {
      throw new DeletionError(Passcodes.table, id);
    }
  };

  const deletePasscodesByIds = async (ids: string[]) => {
    const { rowCount } = await pool.query(sql`
      delete from ${table}
      where ${fields.id} in (${sql.join(ids, sql`,`)})
    `);

    if (rowCount !== ids.length) {
      throw new DeletionError(Passcodes.table, `${ids.join(',')}`);
    }
  };

  return {
    findUnconsumedPasscodeByJtiAndType,
    findUnconsumedPasscodesByJtiAndType,
    insertPasscode,
    consumePasscode,
    increasePasscodeTryCount,
    deletePasscodeById,
    deletePasscodesByIds,
  };
};

/** @deprecated Will be removed soon. Use createPasscodeQueries() factory instead. */
export const {
  findUnconsumedPasscodeByJtiAndType,
  findUnconsumedPasscodesByJtiAndType,
  insertPasscode,
  consumePasscode,
  increasePasscodeTryCount,
  deletePasscodeById,
  deletePasscodesByIds,
} = createPasscodeQueries(envSet.pool);
