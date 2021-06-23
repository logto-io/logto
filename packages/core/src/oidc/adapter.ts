import dayjs from 'dayjs';
import { AdapterFactory } from 'oidc-provider';
import { sql } from 'slonik';
import { OidcModelInstances, OidcModelInstanceDBEntry } from '@logto/schemas';
import pool from '../database/pool';
import { convertToIdentifiers } from '../database/utils';
import { conditional } from '../utils';

const postgresAdapter: AdapterFactory = (modelName) => {
  const { table, fields } = convertToIdentifiers(OidcModelInstances);

  type WithConsumed<T> = T & { consumed?: boolean };
  const withConsumed = <T>(data: T, consumedAt?: number): WithConsumed<T> => ({
    ...data,
    ...(consumedAt ? { consumed: true } : undefined),
  });

  const adapter: ReturnType<AdapterFactory> = {
    upsert: async (id, payload, expiresIn) => {
      await pool.query(sql`
        insert into ${table} (${fields.modelName}, ${fields.id}, ${fields.payload}, ${
        fields.expiresAt
      })
        values (${modelName}, ${id}, ${JSON.stringify(payload)}, ${dayjs()
        .add(expiresIn, 'second')
        .unix()})
        on conflict key do update
      `);
    },
    find: async (id) => {
      const result = await pool.maybeOne<
        Pick<OidcModelInstanceDBEntry, 'payload' | 'consumedAt'>
      >(sql`
        select ${fields.payload}, ${fields.consumedAt}
        from ${table}
        where ${fields.modelName}=${modelName}
        and id=${id}
      `);

      return conditional(result && withConsumed(result));
    },
  };

  return adapter;
};
