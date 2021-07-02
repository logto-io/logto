import dayjs from 'dayjs';
import { AdapterFactory } from 'oidc-provider';
import { IdentifierSqlTokenType, sql, ValueExpressionType } from 'slonik';
import { conditional } from '@logto/essentials';
import { OidcModelInstances, OidcModelInstanceDBEntry } from '@logto/schemas';
import pool from '@/database/pool';
import { convertToIdentifiers } from '@/database/utils';

export default function postgresAdapter(modelName: string) {
  const { table, fields } = convertToIdentifiers(OidcModelInstances);

  type WithConsumed<T> = T & { consumed?: boolean };
  const withConsumed = <T>(data: T, consumedAt?: number): WithConsumed<T> => ({
    ...data,
    ...(consumedAt ? { consumed: true } : undefined),
  });
  type QueryResult = Pick<OidcModelInstanceDBEntry, 'payload' | 'consumedAt'>;
  const convertResult = (result: QueryResult | null) =>
    conditional(result && withConsumed(result.payload, result.consumedAt));
  const setExcluded = (...fields: IdentifierSqlTokenType[]) =>
    sql.join(
      fields.map((field) => sql`${field}=excluded.${field}`),
      sql`, `
    );

  const findByField = async <T extends ValueExpressionType>(
    field: IdentifierSqlTokenType,
    value: T
  ) => {
    const result = await pool.maybeOne<QueryResult>(sql`
        select ${fields.payload}, ${fields.consumedAt}
        from ${table}
        where ${fields.modelName}=${modelName}
        and ${field}=${value}
      `);

    return convertResult(result);
  };

  const adapter: ReturnType<AdapterFactory> = {
    upsert: async (id, payload, expiresIn) => {
      await pool.query(sql`
        insert into ${table} (${sql.join(
        [
          fields.modelName,
          fields.id,
          fields.payload,
          fields.expiresAt,
          fields.userCode,
          fields.uid,
          fields.grantId,
        ],
        sql`, `
      )})
        values (
          ${modelName},
          ${id},
          ${JSON.stringify(payload)},
          ${dayjs().add(expiresIn, 'second').unix()},
          ${payload.userCode ?? null},
          ${payload.uid ?? null},
          ${payload.grantId ?? null}
        )
        on conflict (${fields.modelName}, ${fields.id}) do update
        set ${setExcluded(
          fields.payload,
          fields.expiresAt,
          fields.userCode,
          fields.uid,
          fields.grantId
        )}
      `);
    },
    find: async (id) => findByField(fields.id, id),
    findByUserCode: async (userCode) => findByField(fields.userCode, userCode),
    findByUid: async (uid) => findByField(fields.uid, uid),
    consume: async (id) => {
      await pool.query(sql`
        update ${table}
        set ${fields.consumedAt}=${dayjs().unix()}
        where ${fields.modelName}=${modelName}
        and ${fields.id}=${id}
      `);
    },
    destroy: async (id) => {
      await pool.query(sql`
        delete from ${table}
        where ${fields.modelName}=${modelName}
        and ${fields.id}=${id}
      `);
    },
    revokeByGrantId: async (grantId) => {
      await pool.query(sql`
        delete from ${table}
        where ${fields.modelName}=${modelName}
        and ${fields.grantId}=${grantId}
      `);
    },
  };

  return adapter;
}
