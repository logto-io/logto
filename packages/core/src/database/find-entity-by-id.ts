import type { SchemaLike, GeneratedSchema } from '@logto/schemas';
import type { CommonQueryMethods } from '@silverhand/slonik';
import { sql, NotFoundError } from '@silverhand/slonik';

import RequestError from '#src/errors/RequestError/index.js';
import assertThat from '#src/utils/assert-that.js';
import { isKeyOf } from '#src/utils/schema.js';
import { convertToIdentifiers } from '#src/utils/sql.js';

type WithId<Key> = Key | 'id';

export const buildFindEntityByIdWithPool =
  (pool: CommonQueryMethods) =>
  <
    Key extends string,
    CreateSchema extends Partial<SchemaLike<WithId<Key>>>,
    Schema extends SchemaLike<WithId<Key>>,
  >(
    schema: GeneratedSchema<WithId<Key>, CreateSchema, Schema>
  ) => {
    const { table, fields } = convertToIdentifiers(schema);
    const isKeyOfSchema = isKeyOf(schema);

    // Make sure id is key of the schema
    assertThat(isKeyOfSchema('id'), 'entity.not_exists');

    return async (id: string) => {
      try {
        return await pool.one<Schema>(sql`
          select ${sql.join(Object.values(fields), sql`, `)}
          from ${table}
          where ${fields.id}=${id}
        `);
      } catch (error: unknown) {
        if (error instanceof NotFoundError) {
          throw new RequestError({
            code: 'entity.not_exists_with_id',
            name: schema.table,
            id,
            status: 404,
          });
        }
        throw error;
      }
    };
  };

export const buildFindEntitiesByIdsWithPool =
  (pool: CommonQueryMethods) =>
  <
    Key extends string,
    CreateSchema extends Partial<SchemaLike<WithId<Key>>>,
    Schema extends SchemaLike<WithId<Key>>,
  >(
    schema: GeneratedSchema<WithId<Key>, CreateSchema, Schema>
  ) => {
    const { table, fields } = convertToIdentifiers(schema);
    const isKeyOfSchema = isKeyOf(schema);

    // Make sure id is key of the schema
    assertThat(isKeyOfSchema('id'), 'entity.not_exists');

    return async (ids: string[]) =>
      pool.any<Schema>(sql`
        select ${sql.join(Object.values(fields), sql`, `)}
        from ${table}
        where ${fields.id} in (${ids.length > 0 ? sql.join(ids, sql`, `) : sql`null`})
      `);
  };
