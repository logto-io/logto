import {
  type UserSsoIdentityKeys,
  type CreateUserSsoIdentity,
  type UserSsoIdentity,
  UserSsoIdentities,
} from '@logto/schemas';
import { type Nullable } from '@silverhand/essentials';
import { sql, type CommonQueryMethods } from 'slonik';

import SchemaQueries from '#src/utils/SchemaQueries.js';

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
      from ${UserSsoIdentities.table}
      where ${UserSsoIdentities.fields.issuer} = ${issuer}
      and  ${UserSsoIdentities.fields.identityId} = ${ssoIdentityId}
    `);
  }
}
