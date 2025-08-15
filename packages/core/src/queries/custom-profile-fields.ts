import {
  type CustomProfileField,
  type UpdateCustomProfileFieldSieOrder,
  CustomProfileFields,
} from '@logto/schemas';
import { type CommonQueryMethods, sql } from '@silverhand/slonik';

import {
  buildInsertIntoWithPool,
  buildBatchInsertIntoWithPool,
} from '#src/database/insert-into.js';
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

  const findCustomProfileFieldByName = async (name: string) => {
    return pool.maybeOne<CustomProfileField>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.name} = ${name}
    `);
  };

  const findCustomProfileFieldsByNames = async (names: string[]) => {
    return pool.any<CustomProfileField>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.name} in (${sql.join(names, sql`, `)})
      order by ${fields.sieOrder}
    `);
  };

  const insertCustomProfileFields = buildInsertIntoWithPool(pool)(CustomProfileFields, {
    returning: true,
  });

  const bulkInsertCustomProfileFields = buildBatchInsertIntoWithPool(pool)(CustomProfileFields, {
    returning: true,
  });

  const updateCustomProfileFieldsByName = buildUpdateWhereWithPool(pool)(CustomProfileFields, true);

  const deleteCustomProfileFieldsByName = async (name: string) => {
    return pool.any(sql`
      delete from ${table}
      where ${fields.name} = ${name}
    `);
  };

  /**
   * Update the display order of the custom profile fields in Sign-in Experience.
   */
  const updateFieldOrderInSignInExperience = async (
    data: UpdateCustomProfileFieldSieOrder[]
  ): Promise<readonly CustomProfileField[]> => {
    return pool.any<CustomProfileField>(sql`
      with updated_fields as (
        update ${table}
        set ${fields.sieOrder} = t.new_sie_order::smallint
        from (values ${sql.join(
          data.map(({ name, sieOrder }) => sql`(${name}, ${sieOrder})`),
          sql`,`
        )}) t(name, new_sie_order)
        where ${table}.${fields.name} = t.name
        returning *
      )
      select * from updated_fields
      order by ${fields.sieOrder}
    `);
  };

  return {
    findAllCustomProfileFields,
    findCustomProfileFieldByName,
    findCustomProfileFieldsByNames,
    insertCustomProfileFields,
    updateCustomProfileFieldsByName,
    bulkInsertCustomProfileFields,
    deleteCustomProfileFieldsByName,
    updateFieldOrderInSignInExperience,
  };
};
