import {
  type OidcModelInstance,
  OidcSessionExtensions,
  type OidcSessionExtension,
  OidcModelInstances,
} from '@logto/schemas';
import { type Nullable } from '@silverhand/essentials';
import { sql, type CommonQueryMethods } from '@silverhand/slonik';

import { convertToIdentifiers, convertToTimestamp } from '#src/utils/sql.js';

import { buildInsertIntoWithPool } from '../database/insert-into.js';

const { table, fields } = convertToIdentifiers(OidcSessionExtensions);
const { table: modelInstanceTable, fields: modelInstanceFields } =
  convertToIdentifiers(OidcModelInstances);

const sessionModelName = 'Session';
type SessionInstance = OidcModelInstance & { modelName: typeof sessionModelName };

type NullablePick<T, K extends keyof T> = {
  [P in K]: Nullable<T[P]>;
};
export type SessionInstanceWithExtension = SessionInstance &
  NullablePick<OidcSessionExtension, 'lastSubmission' | 'clientId' | 'accountId' | 'lastActiveAt'>;

export class OidcSessionExtensionsQueries {
  public readonly insert = buildInsertIntoWithPool(this.pool)(OidcSessionExtensions, {
    onConflict: {
      fields: [fields.tenantId, fields.sessionUid],
      setExcludedFields: [
        fields.lastSubmission,
        fields.updatedAt,
        fields.accountId,
        fields.clientId,
      ],
    },
    returning: true,
  });

  constructor(public readonly pool: CommonQueryMethods) {}

  async deleteBySessionUid(sessionUid: string) {
    await this.pool.query(sql`
      delete from ${table}
        where ${fields.sessionUid} = ${sessionUid}
    `);
  }

  async deleteByAccountId(accountId: string) {
    await this.pool.query(sql`
      delete from ${table}
        where ${fields.accountId} = ${accountId}
    `);
  }

  async findBySessionUid(sessionUid: string) {
    return this.pool.maybeOne<OidcSessionExtension>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
        from ${table}
        where ${fields.sessionUid} = ${sessionUid}
    `);
  }

  async findUserActiveSessionsWithExtensions(accountId: string) {
    const { tenantId: _modelInstanceTenantId, ...modelInstanceFieldsWithoutTenantId } =
      modelInstanceFields;
    const modelInstanceTenantIdSelection = sql`${modelInstanceTable}.tenant_id as tenant_id`;

    return this.pool.any<SessionInstanceWithExtension>(sql`
      select ${sql.join(
        [
          modelInstanceTenantIdSelection,
          ...Object.values(modelInstanceFieldsWithoutTenantId),
          fields.lastSubmission,
          fields.clientId,
          fields.accountId,
          fields.lastActiveAt,
        ],
        sql`, `
      )}
      from ${modelInstanceTable}
      left join ${table}
        on ${modelInstanceFields.payload} ->> 'uid' = ${fields.sessionUid}
        and ${fields.accountId} = ${accountId}
      where ${modelInstanceFields.modelName} = ${sessionModelName}
        and ${modelInstanceFields.payload} ->> 'accountId' = ${accountId}
        and ${modelInstanceFields.expiresAt} > ${convertToTimestamp()}
    `);
  }

  async findUserActiveSessionWithExtension(accountId: string, sessionUid: string) {
    const { tenantId: _modelInstanceTenantId, ...modelInstanceFieldsWithoutTenantId } =
      modelInstanceFields;
    const modelInstanceTenantIdSelection = sql`${modelInstanceTable}.tenant_id as tenant_id`;

    return this.pool.maybeOne<SessionInstanceWithExtension>(sql`
      select ${sql.join(
        [
          modelInstanceTenantIdSelection,
          ...Object.values(modelInstanceFieldsWithoutTenantId),
          fields.lastSubmission,
          fields.clientId,
          fields.accountId,
          fields.lastActiveAt,
        ],
        sql`, `
      )}
      from ${modelInstanceTable}
      left join ${table}
        on ${modelInstanceFields.payload} ->> 'uid' = ${fields.sessionUid}
        and ${fields.accountId} = ${accountId}
      where ${modelInstanceFields.modelName} = ${sessionModelName}
        and ${modelInstanceFields.payload} ->> 'accountId' = ${accountId}
        and ${modelInstanceFields.payload} ->> 'uid' = ${sessionUid}
        and ${modelInstanceFields.expiresAt} > ${convertToTimestamp()}
    `);
  }

  /**
   * Upserts last_active_at for the given session.
   * The WHERE clause enforces a 25-second minimum interval — if last_active_at is
   * less than 25 s old the DO UPDATE branch is skipped (rowCount === 0).
   * Returns true if the timestamp was written, false if rate-limited.
   */
  async updateLastActiveAt(sessionUid: string, accountId: string): Promise<boolean> {
    const result = await this.pool.query(sql`
      insert into ${table} (${fields.sessionUid}, ${fields.accountId}, ${fields.lastActiveAt})
      values (${sessionUid}, ${accountId}, ${convertToTimestamp()})
      on conflict (${fields.tenantId}, ${fields.sessionUid}) do update
        set ${fields.lastActiveAt} = ${convertToTimestamp()}
        where ${fields.lastActiveAt} is null
           or ${fields.lastActiveAt} < ${convertToTimestamp(new Date(Date.now() - 25_000))}
    `);
    return result.rowCount > 0;
  }
}
