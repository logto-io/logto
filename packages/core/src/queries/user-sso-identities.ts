import {
  type UserSsoIdentityKeys,
  type CreateUserSsoIdentity,
  type UserSsoIdentity,
  UserSsoIdentities,
} from '@logto/schemas';
import { type Nullable } from '@silverhand/essentials';
import { sql, type CommonQueryMethods } from '@silverhand/slonik';

import SchemaQueries from '#src/utils/SchemaQueries.js';
import { manyRows } from '#src/utils/sql.js';

export default class UserSsoIdentityQueries extends SchemaQueries<
  UserSsoIdentityKeys,
  CreateUserSsoIdentity,
  UserSsoIdentity
> {
  constructor(pool: CommonQueryMethods) {
    super(pool, UserSsoIdentities);
  }

  async findUserSsoIdentityBySsoIdentityId(
    issuer: string,
    ssoIdentityId: string
  ): Promise<Nullable<UserSsoIdentity>> {
    return this.pool.maybeOne<UserSsoIdentity>(sql`
      select *
      from ${sql.identifier([UserSsoIdentities.table])}
      where ${sql.identifier([UserSsoIdentities.fields.issuer])} = ${issuer}
      and ${sql.identifier([UserSsoIdentities.fields.identityId])} = ${ssoIdentityId}
    `);
  }

  async findUserSsoIdentitiesByUserId(userId: string): Promise<readonly UserSsoIdentity[]> {
    return manyRows(
      this.pool.query<UserSsoIdentity>(sql`
        select *
        from ${sql.identifier([UserSsoIdentities.table])}
        where ${sql.identifier([UserSsoIdentities.fields.userId])} = ${userId}
      `)
    );
  }
}
