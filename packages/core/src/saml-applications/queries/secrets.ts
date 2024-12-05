import {
  type CreateSamlApplicationSecret,
  SamlApplicationSecrets,
  type SamlApplicationSecret,
} from '@logto/schemas';
import type { CommonQueryMethods } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import RequestError from '#src/errors/RequestError/index.js';
import { DeletionError } from '#src/errors/SlonikError/index.js';
import { convertToIdentifiers, type OmitAutoSetFields } from '#src/utils/sql.js';

const { table, fields } = convertToIdentifiers(SamlApplicationSecrets);

export const createSamlApplicationSecretsQueries = (pool: CommonQueryMethods) => {
  /**
   * @remarks
   * When creating a SAML app secret, it is set to inactive by default. Since only one secret can be active for a SAML app at a time, creating a new active secret will deactivate all current secrets.
   * If you need to create an active secret, it is best to use a transaction to ensure that all steps are successful.
   */
  const insertInactiveSamlApplicationSecret = async (
    data: Omit<OmitAutoSetFields<CreateSamlApplicationSecret>, 'active'>
  ) => {
    return buildInsertIntoWithPool(pool)(SamlApplicationSecrets, {
      returning: true,
    })({ ...data, active: false });
  };

  const insertActiveSamlApplicationSecret = async (
    data: Omit<OmitAutoSetFields<CreateSamlApplicationSecret>, 'active'>
  ) => {
    return pool.transaction(async (transaction) => {
      const newSecret = await buildInsertIntoWithPool(transaction)(SamlApplicationSecrets, {
        returning: true,
      })({ ...data, active: false });

      // If activating this secret, first deactivate all other secrets of the same application
      await transaction.query(sql`
        update ${table}
        set ${fields.active} = false
        where ${fields.applicationId} = ${newSecret.applicationId}
      `);

      // Update the status of the specified secret
      const updatedSecret = await transaction.one<SamlApplicationSecret>(sql`
        update ${table}
        set ${fields.active} = true
        where ${fields.id} = ${newSecret.id}
        returning ${sql.join(Object.values(fields), sql`, `)}
      `);

      return updatedSecret;
    });
  };

  const findSamlApplicationSecretsByApplicationId = async (applicationId: string) =>
    pool.any<SamlApplicationSecret>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.applicationId}=${applicationId}
    `);

  const findActiveSamlApplicationSecretByApplicationId = async (
    applicationId: string
  ): Promise<SamlApplicationSecret> => {
    const activeSecret = await pool.maybeOne<SamlApplicationSecret>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.applicationId}=${applicationId} and ${fields.active}=true
    `);

    if (!activeSecret) {
      throw new RequestError({ code: 'application.saml.no_active_secret', status: 404 });
    }

    return activeSecret;
  };

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
    insertInactiveSamlApplicationSecret,
    insertActiveSamlApplicationSecret,
    findSamlApplicationSecretsByApplicationId,
    findActiveSamlApplicationSecretByApplicationId,
    findSamlApplicationSecretByApplicationIdAndId,
    deleteSamlApplicationSecretById,
    updateSamlApplicationSecretStatusByApplicationIdAndSecretId,
  };
};
