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
type SessionInstanceWithExtension = SessionInstance &
  NullablePick<OidcSessionExtension, 'lastSubmission' | 'clientId' | 'accountId'>;

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
}
