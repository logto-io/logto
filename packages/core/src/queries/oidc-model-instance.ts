import type { OidcModelInstance, OidcModelInstancePayload } from '@logto/schemas';
import { Applications, OidcModelInstances } from '@logto/schemas';
import type { Nullable } from '@silverhand/essentials';
import { conditional } from '@silverhand/essentials';
import type { CommonQueryMethods, ValueExpression } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';
import { addSeconds, isBefore } from 'date-fns';

import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { convertToIdentifiers, convertToTimestamp } from '#src/utils/sql.js';

export type WithConsumed<T> = T & { consumed?: boolean };
export type QueryResult = Pick<OidcModelInstance, 'payload' | 'consumedAt'>;

const { table, fields } = convertToIdentifiers(OidcModelInstances);
const { table: applicationTable } = convertToIdentifiers(Applications);

export type ActiveApplicationGrantInstance = Pick<
  OidcModelInstance,
  'id' | 'payload' | 'expiresAt'
>;
export type GrantApplicationType = 'thirdParty' | 'firstParty';
const sessionModelName = 'Session';

/**
 * This interval helps to avoid concurrency issues when exchanging the rotating refresh token multiple times within a given timeframe;
 * During the leeway window (in seconds), the consumed refresh token will be considered as valid.
 *
 * This is useful for distributed apps and serverless apps like Next.js, in which there is no shared memory.
 */
// Hard-code this value since 3 seconds is a reasonable number for concurrency and no need for further configuration
const refreshTokenReuseInterval = 3;

const isConsumed = (modelName: string, consumedAt: Nullable<number>): boolean => {
  if (!consumedAt) {
    return false;
  }

  if (modelName !== 'RefreshToken') {
    return Boolean(consumedAt);
  }

  return isBefore(addSeconds(consumedAt, refreshTokenReuseInterval), Date.now());
};

const withConsumed = <T>(
  data: T,
  modelName: string,
  consumedAt: Nullable<number>
): WithConsumed<T> => ({
  ...data,
  ...(isConsumed(modelName, consumedAt) ? { consumed: true } : undefined),
});

// eslint-disable-next-line @typescript-eslint/ban-types
const convertResult = (result: QueryResult | null, modelName: string) =>
  conditional(result && withConsumed(result.payload, modelName, result.consumedAt));

const findByModel = (modelName: string) => sql`
  select ${fields.payload}, ${fields.consumedAt}
  from ${table}
  where ${fields.modelName}=${modelName}
`;

export const createOidcModelInstanceQueries = (pool: CommonQueryMethods) => {
  const upsertInstance = buildInsertIntoWithPool(pool)(OidcModelInstances, {
    onConflict: {
      fields: [fields.tenantId, fields.modelName, fields.id],
      setExcludedFields: [fields.payload, fields.expiresAt],
    },
  });

  const findPayloadById = async (modelName: string, id: string) => {
    const result = await pool.maybeOne<QueryResult>(sql`
      ${findByModel(modelName)}
      and ${fields.id}=${id}
    `);

    return convertResult(result, modelName);
  };

  /**
   * This function is designed to query by indexed JSONB fields (e.g. `uid` and `userCode`)
   *  to leverage the expression index for better performance.
   *
   * @see findPayloadByUid
   * @see findPayloadByUserCode
   */
  const findPayloadByIndexedPayloadField = async <T extends ValueExpression>(
    modelName: string,
    field: 'uid' | 'userCode',
    value: T
  ) => {
    const condition =
      field === 'uid'
        ? sql`${fields.payload}->>'uid'=${value}`
        : sql`${fields.payload}->>'userCode'=${value}`;

    // Fetch all matching records.
    const results = await pool.any<QueryResult>(sql`
      ${findByModel(modelName)}
      and ${condition}
    `);

    // Rarely, duplicate UIDs can exist for different sessions.
    // This query may throw `DataIntegrityError`.
    // If that happens, delete all duplicates and return `null`.
    if (results.length > 1) {
      // Delete all duplicates.
      await pool.query(sql`
        delete from ${table}
        where ${fields.modelName}=${modelName}
          and ${condition}
      `);
      return;
    }

    // If there is only one record, return the result.
    return results[0] ? convertResult(results[0], modelName) : undefined;
  };

  const findPayloadByUid = async <T extends ValueExpression>(modelName: string, value: T) =>
    findPayloadByIndexedPayloadField(modelName, 'uid', value);

  const findPayloadByUserCode = async <T extends ValueExpression>(modelName: string, value: T) =>
    findPayloadByIndexedPayloadField(modelName, 'userCode', value);

  /**
   * @deprecated
   * This dynamic JSONB key query shape may prevent expression-index
   *  usage with prepared generic plans. Keep it as a backup/reference path only.
   *
   * Use `findPayloadByUid` or `findPayloadByUserCode` instead for indexed queries.
   */
  const findPayloadByPayloadField = async <
    T extends ValueExpression,
    Field extends keyof OidcModelInstancePayload,
  >(
    modelName: string,
    field: Field,
    value: T
  ) => {
    const results = await pool.any<QueryResult>(sql`
      ${findByModel(modelName)}
      and ${fields.payload}->>${field}=${value}
    `);

    // Rarely, duplicate UIDs can exist for different sessions.
    // This query may throw `DataIntegrityError`.
    // If that happens, delete all duplicates and return `null`.
    if (results.length > 1) {
      // Delete all duplicates.
      await pool.query(sql`
        delete from ${table}
        where ${fields.modelName}=${modelName}
          and ${fields.payload}->>${field}=${value}
      `);
      return;
    }

    // If there is only one record, return the result.
    return results[0] ? convertResult(results[0], modelName) : undefined;
  };

  const consumeInstanceById = async (modelName: string, id: string) => {
    await pool.query(sql`
      update ${table}
      set ${fields.consumedAt}=${convertToTimestamp()}
      where ${fields.modelName}=${modelName}
      and ${fields.id}=${id}
    `);
  };

  const destroyInstanceById = async (modelName: string, id: string) => {
    await pool.query(sql`
      delete from ${table}
      where ${fields.modelName}=${modelName}
      and ${fields.id}=${id}
    `);
  };

  const revokeInstanceByGrantId = async (modelName: string, grantId: string) => {
    await pool.query(sql`
      delete from ${table}
      where ${fields.modelName}=${modelName}
      and ${fields.payload} ? 'grantId'
      and ${fields.payload}->>'grantId'=${grantId}
    `);
  };

  const revokeInstanceByUserId = async (modelName: string, userId: string) => {
    await pool.query(sql`
      delete from ${table}
      where ${fields.modelName}=${modelName}
      and ${fields.payload}->>'accountId'=${userId}
    `);
  };

  const findUserActiveApplicationGrants = async (
    userId: string,
    applicationType?: GrantApplicationType
  ) => {
    const oidcModelInstanceAlias = 'oidc_model_instance';
    const applicationAlias = 'application';
    const oidcModelInstanceTableIdentifier = sql.identifier([oidcModelInstanceAlias]);
    const applicationTableIdentifier = sql.identifier([applicationAlias]);
    const oidcModelInstanceId = sql.identifier([
      oidcModelInstanceAlias,
      OidcModelInstances.fields.id,
    ]);
    const oidcModelInstancePayload = sql.identifier([
      oidcModelInstanceAlias,
      OidcModelInstances.fields.payload,
    ]);
    const oidcModelInstanceExpiresAt = sql.identifier([
      oidcModelInstanceAlias,
      OidcModelInstances.fields.expiresAt,
    ]);
    const oidcModelInstanceModelName = sql.identifier([
      oidcModelInstanceAlias,
      OidcModelInstances.fields.modelName,
    ]);
    const applicationId = sql.identifier([applicationAlias, Applications.fields.id]);
    const applicationIsThirdParty = sql.identifier([
      applicationAlias,
      Applications.fields.isThirdParty,
    ]);

    return pool.any<ActiveApplicationGrantInstance>(sql`
      select ${oidcModelInstanceId}, ${oidcModelInstancePayload}, ${oidcModelInstanceExpiresAt}
      from ${table} as ${oidcModelInstanceTableIdentifier}
      inner join ${applicationTable} as ${applicationTableIdentifier}
        on ${oidcModelInstancePayload}->>'clientId'=${applicationId}
      where ${oidcModelInstanceModelName}='Grant'
        and ${oidcModelInstancePayload}->>'accountId'=${userId}
        ${
          applicationType
            ? sql`and ${applicationIsThirdParty}=${applicationType === 'thirdParty'}`
            : sql``
        }
        and ${oidcModelInstanceExpiresAt} > ${convertToTimestamp()}
    `);
  };

  const findUserActiveGrantsByClientId = async (userId: string, clientId: string) => {
    return pool.any<ActiveApplicationGrantInstance>(sql`
      select ${fields.id}, ${fields.payload}, ${fields.expiresAt}
      from ${table}
      where ${fields.modelName}='Grant'
        and ${fields.payload}->>'accountId'=${userId}
        and ${fields.payload}->>'clientId'=${clientId}
        and ${fields.expiresAt} > ${convertToTimestamp()}
    `);
  };

  const findUserActiveSessionUidByGrantId = async (accountId: string, grantId: string) => {
    // A grant is expected to be associated with at most one active session authorization entry.
    // Limit to one row for targeted cleanup without scanning all sessions.
    return pool.maybeOne<{ sessionUid: string }>(sql`
      select ${fields.payload} ->> 'uid' as "sessionUid"
      from ${table}
      where ${fields.modelName} = ${sessionModelName}
        and ${fields.payload} ->> 'accountId' = ${accountId}
        and ${fields.expiresAt} > ${convertToTimestamp()}
        and exists (
          select 1
          from jsonb_each(${fields.payload} -> 'authorizations') as authorization_entry
          where authorization_entry.value ->> 'grantId' = ${grantId}
        )
      limit 1
    `);
  };

  return {
    upsertInstance,
    findPayloadById,
    findPayloadByPayloadField,
    findPayloadByUid,
    findPayloadByUserCode,
    consumeInstanceById,
    destroyInstanceById,
    revokeInstanceByGrantId,
    revokeInstanceByUserId,
    findUserActiveApplicationGrants,
    findUserActiveGrantsByClientId,
    findUserActiveSessionUidByGrantId,
  };
};
