import {
  OidcModelInstance,
  OidcModelInstanceDBEntry,
  OidcModelInstancePayload,
  OidcModelInstances,
} from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { sql, ValueExpressionType } from 'slonik';

import { buildInsertInto } from '@/database/insert-into';
import pool from '@/database/pool';
import { convertToIdentifiers, convertToTimestamp } from '@/database/utils';

export type WithConsumed<T> = T & { consumed?: boolean };
export type QueryResult = Pick<OidcModelInstance, 'payload' | 'consumedAt'>;

const { table, fields } = convertToIdentifiers(OidcModelInstances);

const withConsumed = <T>(data: T, consumedAt?: number | null): WithConsumed<T> => ({
  ...data,
  ...(consumedAt ? { consumed: true } : undefined),
});

const convertResult = (result: QueryResult | null) =>
  conditional(result && withConsumed(result.payload, result.consumedAt));

export const upsertInstance = buildInsertInto<OidcModelInstanceDBEntry>(pool, OidcModelInstances, {
  onConflict: {
    fields: [fields.modelName, fields.id],
    setExcludedFields: [fields.payload, fields.expiresAt],
  },
});

const findByModel = (modelName: string) => sql`
  select ${fields.payload}, ${fields.consumedAt}
  from ${table}
  where ${fields.modelName}=${modelName}
`;

export const findPayloadById = async (modelName: string, id: string) => {
  const result = await pool.maybeOne<QueryResult>(sql`
    ${findByModel(modelName)}
    and ${fields.id}=${id}
  `);

  return convertResult(result);
};

export const findPayloadByPayloadField = async <
  T extends ValueExpressionType,
  Field extends keyof OidcModelInstancePayload
>(
  modelName: string,
  field: Field,
  value: T
) => {
  const result = await pool.maybeOne<QueryResult>(sql`
    ${findByModel(modelName)}
    and ${fields.payload}->>${field}=${value}
  `);

  return convertResult(result);
};

export const consumeInstanceById = async (modelName: string, id: string) => {
  await pool.query(sql`
    update ${table}
    set ${fields.consumedAt}=${convertToTimestamp()}
    where ${fields.modelName}=${modelName}
    and ${fields.id}=${id}
  `);
};

export const destoryInstanceById = async (modelName: string, id: string) => {
  await pool.query(sql`
    delete from ${table}
    where ${fields.modelName}=${modelName}
    and ${fields.id}=${id}
  `);
};

export const revokeInstanceByGrantId = async (modelName: string, grantId: string) => {
  await pool.query(sql`
    delete from ${table}
    where ${fields.modelName}=${modelName}
    and ${fields.payload}->>'grantId'=${grantId}
  `);
};
