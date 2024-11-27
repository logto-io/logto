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

  const deleteSamlApplicationSecretById = async (id: string) => {
    const { rowCount } = await pool.query(sql`
      delete from ${table}
      where ${fields.id} = ${id}
    `);

    if (rowCount < 1) {
      throw new DeletionError(SamlApplicationSecrets.table);
    }
  };

  return {
    insertSamlApplicationSecret,
    findSamlApplicationSecretsByApplicationId,
    deleteSamlApplicationSecretById,
  };
};
