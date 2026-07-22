import {
  type CreateSamlSsoConnectorSigningKey,
  SamlSsoConnectorSigningKeys,
  type SamlSsoConnectorSigningKey,
} from '@logto/schemas';
import type { CommonQueryMethods } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { DeletionError } from '#src/errors/SlonikError/index.js';
import { convertToIdentifiers, type OmitAutoSetFields } from '#src/utils/sql.js';

const { table, fields } = convertToIdentifiers(SamlSsoConnectorSigningKeys);

export const createSamlSsoConnectorSigningKeyQueries = (pool: CommonQueryMethods) => {
  const insertInactiveSigningKey = async (
    data: Omit<OmitAutoSetFields<CreateSamlSsoConnectorSigningKey>, 'active'>
  ) =>
    buildInsertIntoWithPool(pool)(SamlSsoConnectorSigningKeys, { returning: true })({
      ...data,
      active: false,
    });

  /**
   * Insert a new key and make it the sole active key for the connector, atomically deactivating any
   * currently-active key.
   */
  const insertActiveSigningKey = async (
    data: Omit<OmitAutoSetFields<CreateSamlSsoConnectorSigningKey>, 'active'>
  ) =>
    pool.transaction(async (transaction) => {
      const newKey = await buildInsertIntoWithPool(transaction)(SamlSsoConnectorSigningKeys, {
        returning: true,
      })({ ...data, active: false });

      await transaction.query(sql`
        update ${table}
        set ${fields.active} = false
        where ${fields.ssoConnectorId} = ${newKey.ssoConnectorId}
      `);

      return transaction.one<SamlSsoConnectorSigningKey>(sql`
        update ${table}
        set ${fields.active} = true
        where ${fields.id} = ${newKey.id}
        returning ${sql.join(Object.values(fields), sql`, `)}
      `);
    });

  const findSigningKeysBySsoConnectorId = async (ssoConnectorId: string) =>
    pool.any<SamlSsoConnectorSigningKey>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.ssoConnectorId} = ${ssoConnectorId}
    `);

  // Returns the active key, or null when signing is not (yet) usable — the sign-in path fails closed.
  const findActiveSigningKeyBySsoConnectorId = async (ssoConnectorId: string) =>
    pool.maybeOne<SamlSsoConnectorSigningKey>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.ssoConnectorId} = ${ssoConnectorId} and ${fields.active} = true
    `);

  const findSigningKeyBySsoConnectorIdAndId = async (ssoConnectorId: string, id: string) =>
    pool.one<SamlSsoConnectorSigningKey>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.ssoConnectorId} = ${ssoConnectorId} and ${fields.id} = ${id}
    `);

  /** Activate (deactivating any other active key first) or deactivate a specific key. */
  const updateSigningKeyStatusBySsoConnectorIdAndId = async (
    ssoConnectorId: string,
    id: string,
    active: boolean
  ) =>
    pool.transaction(async (transaction) => {
      if (active) {
        await transaction.query(sql`
          update ${table}
          set ${fields.active} = false
          where ${fields.ssoConnectorId} = ${ssoConnectorId}
        `);
      }

      return transaction.one<SamlSsoConnectorSigningKey>(sql`
        update ${table}
        set ${fields.active} = ${active}
        where ${fields.id} = ${id} and ${fields.ssoConnectorId} = ${ssoConnectorId}
        returning ${sql.join(Object.values(fields), sql`, `)}
      `);
    });

  const deleteSigningKeyById = async (id: string) => {
    const { rowCount } = await pool.query(sql`
      delete from ${table}
      where ${fields.id} = ${id}
    `);

    if (rowCount < 1) {
      throw new DeletionError(SamlSsoConnectorSigningKeys.table);
    }
  };

  const deleteSigningKeysBySsoConnectorId = async (ssoConnectorId: string) => {
    await pool.query(sql`
      delete from ${table}
      where ${fields.ssoConnectorId} = ${ssoConnectorId}
    `);
  };

  return {
    insertInactiveSigningKey,
    insertActiveSigningKey,
    findSigningKeysBySsoConnectorId,
    findActiveSigningKeyBySsoConnectorId,
    findSigningKeyBySsoConnectorIdAndId,
    updateSigningKeyStatusBySsoConnectorIdAndId,
    deleteSigningKeyById,
    deleteSigningKeysBySsoConnectorId,
  };
};
