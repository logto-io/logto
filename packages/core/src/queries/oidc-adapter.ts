import pool from '@/database/pool';
import { convertToIdentifiers, insertInto, setExcluded } from '@/database/utils';
import { conditional } from '@logto/essentials';
import {
  OidcModelInstanceDBEntry,
  OidcModelInstancePayload,
  OidcModelInstances,
} from '@logto/schemas';
import dayjs from 'dayjs';
import { sql, ValueExpressionType } from 'slonik';

export type WithConsumed<T> = T & { consumed?: boolean };
export type QueryResult = Pick<OidcModelInstanceDBEntry, 'payload' | 'consumedAt'>;

const { table, fields } = convertToIdentifiers(OidcModelInstances);

const withConsumed = <T>(data: T, consumedAt?: number): WithConsumed<T> => ({
  ...data,
  ...(consumedAt ? { consumed: true } : undefined),
});

const convertResult = (result: QueryResult | null) =>
  conditional(result && withConsumed(result.payload, result.consumedAt));

export const upsertInstance = async (
  modelName: string,
  id: string,
  payload: OidcModelInstancePayload,
  expiresIn: number
) => {
  await pool.query(
    sql`
      ${insertInto<OidcModelInstanceDBEntry>(
        table,
        fields,
        ['modelName', 'id', 'payload', 'expiresAt'],
        {
          modelName,
          id,
          payload,
          expiresAt: dayjs().add(expiresIn, 'second').unix(),
        }
      )}
      on conflict (${fields.modelName}, ${fields.id}) do update
      set ${setExcluded(fields.payload, fields.expiresAt)}
    `
  );
};

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
    set ${fields.consumedAt}=${dayjs().unix()}
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
