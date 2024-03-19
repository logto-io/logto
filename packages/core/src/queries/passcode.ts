import type { TemplateType } from '@logto/connector-kit';
import type { Passcode, RequestVerificationCodePayload } from '@logto/schemas';
import { Passcodes } from '@logto/schemas';
import type { CommonQueryMethods } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { DeletionError } from '#src/errors/SlonikError/index.js';
import { conditionalSql, convertToIdentifiers } from '#src/utils/sql.js';

const { table, fields } = convertToIdentifiers(Passcodes);

type FindByIdentifierAndTypeProperties = {
  type: TemplateType;
} & RequestVerificationCodePayload;

const buildSqlForFindByJtiAndType = (jti: string, type: TemplateType) => sql`
  select ${sql.join(Object.values(fields), sql`, `)}
  from ${table}
  where ${fields.interactionJti}=${jti} and ${fields.type}=${type} and ${fields.consumed} = false
`;

// Identifier requires either a valid email address or phone number
const buildSqlForFindByIdentifierAndType = ({
  type,
  ...identifier
}: FindByIdentifierAndTypeProperties) => sql`
  select ${sql.join(Object.values(fields), sql`, `)}
  from ${table}
  where 
    ${conditionalSql(
      'email' in identifier && identifier.email,
      (email) => sql`${fields.email}=${email}`
    )}
    ${conditionalSql(
      'phone' in identifier && identifier.phone,
      (phone) => sql`${fields.phone}=${phone}`
    )}
    and ${fields.type}=${type} and ${fields.consumed} = false
`;

export const createPasscodeQueries = (pool: CommonQueryMethods) => {
  const findUnconsumedPasscodeByJtiAndType = async (jti: string, type: TemplateType) =>
    pool.maybeOne<Passcode>(buildSqlForFindByJtiAndType(jti, type));

  const findUnconsumedPasscodesByJtiAndType = async (jti: string, type: TemplateType) =>
    pool.any<Passcode>(buildSqlForFindByJtiAndType(jti, type));

  const findUnconsumedPasscodeByIdentifierAndType = async (
    properties: FindByIdentifierAndTypeProperties
  ) => pool.maybeOne<Passcode>(buildSqlForFindByIdentifierAndType(properties));

  const findUnconsumedPasscodesByIdentifierAndType = async (
    properties: FindByIdentifierAndTypeProperties
  ) => pool.any<Passcode>(buildSqlForFindByIdentifierAndType(properties));

  const insertPasscode = buildInsertIntoWithPool(pool)(Passcodes, {
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
    findUnconsumedPasscodeByIdentifierAndType,
    findUnconsumedPasscodesByIdentifierAndType,
    insertPasscode,
    consumePasscode,
    increasePasscodeTryCount,
    deletePasscodeById,
    deletePasscodesByIds,
  };
};
