import { SamlApplicationSecrets, type SamlApplicationSecret } from '@logto/schemas';
import type { CommonQueryMethods } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { DeletionError } from '#src/errors/SlonikError/index.js';
import { convertToIdentifiers } from '#src/utils/sql.js';

const { table, fields } = convertToIdentifiers(SamlApplicationSecrets);

export const createSamlApplicationSecretsQueries = (pool: CommonQueryMethods) => {
  const insertSamlApplicationSecret = buildInsertIntoWithPool(pool)(SamlApplicationSecrets, {
    returning: true,
  });

  const findSamlApplicationSecretsByApplicationId = async (applicationId: string) =>
    pool.any<SamlApplicationSecret>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.applicationId}=${applicationId}
    `);

  const findSamlApplicationSecretByApplicationIdAndId = async (applicationId: string, id: string) =>
    pool.one<SamlApplicationSecret>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.applicationId} = ${applicationId} and ${fields.id} = ${id}
    `);

  const deleteSamlApplicationSecretById = async (id: string) => {
    const { rowCount } = await pool.query(sql`
      delete from ${table}
      where ${fields.id} = ${id}
    `);

    if (rowCount < 1) {
      throw new DeletionError(SamlApplicationSecrets.table);
    }
  };

  const updateSamlApplicationSecretStatusByApplicationIdAndSecretId = async (
    applicationId: string,
    secretId: string,
    active: boolean
  ) => {
    return pool.transaction(async (transaction) => {
      if (active) {
        // If activating this secret, first deactivate all other secrets of the same application
        await transaction.query(sql`
          update ${table}
          set ${fields.active} = false
          where ${fields.applicationId} = ${applicationId}
        `);
      }

      // Update the status of the specified secret
      const updatedSecret = await transaction.one<SamlApplicationSecret>(sql`
        update ${table}
        set ${fields.active} = ${active}
        where ${fields.id} = ${secretId} and ${fields.applicationId} = ${applicationId}
        returning ${sql.join(Object.values(fields), sql`, `)}
      `);

      return updatedSecret;
    });
  };

  return {
    insertSamlApplicationSecret,
    findSamlApplicationSecretsByApplicationId,
    findSamlApplicationSecretByApplicationIdAndId,
    deleteSamlApplicationSecretById,
    updateSamlApplicationSecretStatusByApplicationIdAndSecretId,
  };
};
