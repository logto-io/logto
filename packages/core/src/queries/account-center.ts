import {
  defaultMaximumAuthenticationAgeInSeconds,
  type AccountCenter,
  AccountCenters,
  type AccountCenterKeys,
  type CreateAccountCenter,
} from '@logto/schemas';
import { type CommonQueryMethods } from '@silverhand/slonik';

import { type WellKnownCache } from '../caches/well-known.js';
import RequestError from '../errors/RequestError/index.js';
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

  /**
   * The freshness window the Account API enforces for sensitive operations. Reads the memoized
   * account center row, and falls back to the default when the tenant has no row, which is what
   * the previous constant did.
   */
  public readonly getMaximumAuthenticationAgeInSeconds = async (): Promise<number> => {
    const accountCenter = await this.findDefaultAccountCenter().catch((error: unknown) => {
      if (error instanceof RequestError && error.code === 'entity.not_exists_with_id') {
        return;
      }

      throw error;
    });

    return (
      accountCenter?.maximumAuthenticationAgeInSeconds ?? defaultMaximumAuthenticationAgeInSeconds
    );
  };
}
