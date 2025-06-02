import {
  type AccountCenter,
  AccountCenters,
  type AccountCenterKeys,
  type CreateAccountCenter,
} from '@logto/schemas';
import { type CommonQueryMethods } from '@silverhand/slonik';

import { type WellKnownCache } from '../caches/well-known.js';
import SchemaQueries from '../utils/SchemaQueries.js';

const id = 'default';

export class AccountCenterQueries extends SchemaQueries<
  AccountCenterKeys,
  CreateAccountCenter,
  AccountCenter
> {
  public readonly findDefaultAccountCenter = this.wellKnownCache.memoize(
    // eslint-disable-next-line unicorn/consistent-function-scoping
    async () => this.findById(id),
    ['account-center']
  );

  public readonly updateDefaultAccountCenter = this.wellKnownCache.mutate(
    // eslint-disable-next-line unicorn/consistent-function-scoping
    async (accountCenter: Partial<AccountCenter>) => this.updateById(id, accountCenter, 'replace'),
    ['account-center']
  );

  constructor(
    public readonly pool: CommonQueryMethods,
    public readonly wellKnownCache: WellKnownCache
  ) {
    super(pool, AccountCenters);
  }
}
