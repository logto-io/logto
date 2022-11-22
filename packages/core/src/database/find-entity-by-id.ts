import type { SchemaLike, GeneratedSchema } from '@logto/schemas';
import { convertToIdentifiers } from '@logto/shared';
import { sql, NotFoundError } from 'slonik';

import envSet from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import assertThat from '#src/utils/assert-that.js';
import { isKeyOf } from '#src/utils/schema.js';

export const buildFindEntityById = <Schema extends SchemaLike, ReturnType extends SchemaLike>(
  schema: GeneratedSchema<Schema & { id: string }>
) => {
  const { table, fields } = convertToIdentifiers(schema);
  const isKeyOfSchema = isKeyOf(schema);

  // Make sure id is key of the schema
  assertThat(isKeyOfSchema('id'), 'entity.not_exists');

  return async (id: string) => {
    try {
      return await envSet.pool.one<ReturnType>(sql`
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
