import type { Application, OidcModelInstance, OidcModelInstancePayload } from '@logto/schemas';
import { Applications, CimdGrantClientSnapshots, OidcModelInstances } from '@logto/schemas';
import { ConsoleLog } from '@logto/shared';
import type { Nullable } from '@silverhand/essentials';
import { conditional } from '@silverhand/essentials';
import type { CommonQueryMethods, SqlSqlToken, ValueExpression } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';
import chalk from 'chalk';
import { addSeconds, isBefore } from 'date-fns';

import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { convertToIdentifiers, convertToTimestamp } from '#src/utils/sql.js';

export type WithConsumed<T> = T & { consumed?: boolean };
export type QueryResult = Pick<OidcModelInstance, 'payload' | 'consumedAt'>;

const { table, fields } = convertToIdentifiers(OidcModelInstances);
const { table: applicationTable } = convertToIdentifiers(Applications);
const cimdGrantClientSnapshots = convertToIdentifiers(CimdGrantClientSnapshots, true);

export type ActiveGrantInstance = Pick<OidcModelInstance, 'id' | 'payload' | 'expiresAt'>;
export type ActiveApplicationGrantInstance = ActiveGrantInstance & {
  application: Pick<Application, 'id' | 'name'>;
};
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
/**
 * Kept small because each deleted row also updates every index on the table, so the
 * per-statement random I/O must fit within a storage-throttled moment without hitting
 * the statement timeout.
 */
const revokeInstanceBatchSize = 500;
/** Safety valve so a revocation request stays bounded even for pathological instance counts. */
const maxRevokeInstanceBatches = 1000;
/** Fixed-length array to drive the bounded batch loop without a mutable counter. */
const revokeInstanceBatchIterations = Array.from({ length: maxRevokeInstanceBatches });

const consoleLog = new ConsoleLog(chalk.magenta('query'));

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

    // Fetch up to 2 matching records to detect duplicates without loading all of them.
    const results = await pool.any<QueryResult>(sql`
      ${findByModel(modelName)}
      and ${condition}
      limit 2
    `);

    // Rarely, duplicate UIDs can exist for different sessions.
    // This query may throw `DataIntegrityError`.
    // If that happens, delete all duplicates and return no result (`undefined`).
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

  /**
   * Delete matching instances in bounded batches until none remain, so no single statement can
   * exceed the database statement timeout.
   *
   * @param target - Human-readable principal for the cap log, e.g. `accountId <userId>`.
   * @param condition - Must include the payload key-existence clause matching the partial index
   * predicate, or the batches stop being index-backed.
   */
  const revokeInstancesInBatches = async (
    modelName: string,
    target: string,
    condition: SqlSqlToken
  ) => {
    for (const _ of revokeInstanceBatchIterations) {
      // eslint-disable-next-line no-await-in-loop -- revocation batches must run serially to keep each delete bounded
      const { rowCount } = await pool.query(sql`
        delete from ${table}
        where ${fields.id} in (
          select ${fields.id}
          from ${table}
          where ${fields.modelName}=${modelName}
          and ${condition}
          limit ${revokeInstanceBatchSize}
        )
      `);

      if (!rowCount) {
        return;
      }
    }

    consoleLog.error(
      `Revoking ${modelName} instances for ${target} did not finish within ${maxRevokeInstanceBatches} batches; remaining instances are left for a retry.`
    );
  };

  const revokeInstanceByGrantId = async (modelName: string, grantId: string) =>
    revokeInstancesInBatches(
      modelName,
      `grantId ${grantId}`,
      sql`${fields.payload} ? 'grantId'
          and ${fields.payload}->>'grantId'=${grantId}`
    );

  const revokeInstanceByUserId = async (modelName: string, userId: string) =>
    revokeInstancesInBatches(
      modelName,
      `accountId ${userId}`,
      sql`${fields.payload} ? 'accountId'
          and ${fields.payload}->>'accountId'=${userId}`
    );

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
    const applicationName = sql.identifier([applicationAlias, Applications.fields.name]);
    const applicationIsThirdParty = sql.identifier([
      applicationAlias,
      Applications.fields.isThirdParty,
    ]);

    return pool.any<ActiveApplicationGrantInstance>(sql`
      select ${oidcModelInstanceId}, ${oidcModelInstancePayload}, ${oidcModelInstanceExpiresAt},
        json_build_object(
          'id', ${applicationId},
          'name', ${applicationName}
        ) as application
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

  /**
   * Active grants of CIMD (client ID metadata document) clients, shaped like the registered
   * application grants. They are URL identities without an `applications` row, so
   * `findUserActiveApplicationGrants` cannot see them; a grant is a CIMD grant exactly when a
   * consent-time snapshot row exists for it, and the snapshot carries the approved display data.
   *
   * The identifier URL stands in for a missing name: `client_name` is optional in the metadata
   * document, and the snapshot write normalizes an empty one to null.
   */
  const findUserActiveCimdGrants = async (userId: string) => {
    /** The snapshot table also has a `tenant_id` column, so this side of the join must qualify. */
    const oidcModelInstanceTenantId = sql.identifier([
      OidcModelInstances.table,
      OidcModelInstances.fields.tenantId,
    ]);

    return pool.any<ActiveApplicationGrantInstance>(sql`
      select ${fields.id}, ${fields.payload}, ${fields.expiresAt},
        json_build_object(
          'id', ${cimdGrantClientSnapshots.fields.clientId},
          'name', coalesce(
            ${cimdGrantClientSnapshots.fields.name},
            ${cimdGrantClientSnapshots.fields.clientId}
          )
        ) as application
      from ${table}
      inner join ${cimdGrantClientSnapshots.table}
        on ${cimdGrantClientSnapshots.fields.tenantId}=${oidcModelInstanceTenantId}
        and ${cimdGrantClientSnapshots.fields.grantId}=${fields.id}
      where ${fields.modelName}='Grant'
        and ${fields.payload}->>'accountId'=${userId}
        and ${fields.expiresAt} > ${convertToTimestamp()}
    `);
  };

  const findUserActiveGrantsByClientId = async (userId: string, clientId: string) => {
    return pool.any<ActiveGrantInstance>(sql`
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
    findUserActiveCimdGrants,
    findUserActiveGrantsByClientId,
    findUserActiveSessionUidByGrantId,
  };
};
