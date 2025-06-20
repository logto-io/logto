import {
  type CustomProfileField,
  type UpdateCustomProfileFieldSieOrder,
  CustomProfileFields,
} from '@logto/schemas';
import { type CommonQueryMethods, sql } from '@silverhand/slonik';

import { buildDeleteByIdWithPool } from '#src/database/delete-by-id.js';
import { buildFindEntityByIdWithPool } from '#src/database/find-entity-by-id.js';
import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { buildUpdateWhereWithPool } from '#src/database/update-where.js';
import { convertToIdentifiers } from '#src/utils/sql.js';

const { table, fields } = convertToIdentifiers(CustomProfileFields);

export const createCustomProfileFieldsQueries = (pool: CommonQueryMethods) => {
  const findAllCustomProfileFields = async () => {
    return pool.any<CustomProfileField>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      order by ${fields.sieOrder}
    `);
  };

  const findCustomProfileFieldById = buildFindEntityByIdWithPool(pool)(CustomProfileFields);

  const findCustomProfileFieldsByIds = async (ids: string[]) => {
    return pool.any<CustomProfileField>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.id} in (${sql.join(ids, sql`, `)})
      order by ${fields.sieOrder}
    `);
  };

  const insertCustomProfileFields = buildInsertIntoWithPool(pool)(CustomProfileFields, {
    returning: true,
  });

  const updateCustomProfileFieldsById = buildUpdateWhereWithPool(pool)(CustomProfileFields, true);

  const deleteCustomProfileFieldsById = buildDeleteByIdWithPool(pool, CustomProfileFields.table);

  /**
   * Update the display order of the custom profile fields in Sign-in Experience.
   */
  const updateFieldOrderInSignInExperience = async (data: UpdateCustomProfileFieldSieOrder[]) => {
    return pool.any(sql`
      update ${table}
      set ${fields.sieOrder} = t.new_sie_order::smallint
      from (values ${sql.join(
        data.map(({ id, sieOrder }) => sql`(${id}, ${sieOrder})`),
        sql`,`
      )}) t(id, new_sie_order)
      where ${table}.${fields.id} = t.id
      returning *
    `);
  };

  return {
    findAllCustomProfileFields,
    findCustomProfileFieldById,
    findCustomProfileFieldsByIds,
    insertCustomProfileFields,
    updateCustomProfileFieldsById,
    deleteCustomProfileFieldsById,
    updateFieldOrderInSignInExperience,
  };
};
