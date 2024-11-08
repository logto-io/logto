import {
  type AccountCenter,
  AccountCenters,
  type AccountCenterKeys,
  type CreateAccountCenter,
} from '@logto/schemas';
import { type CommonQueryMethods } from '@silverhand/slonik';

import SchemaQueries from '../utils/SchemaQueries.js';

const id = 'default';

export class AccountCenterQueries extends SchemaQueries<
  AccountCenterKeys,
  CreateAccountCenter,
  AccountCenter
> {
  constructor(public readonly pool: CommonQueryMethods) {
    super(pool, AccountCenters);
  }

  public readonly findDefaultAccountCenter = async () => {
    return this.findById(id);
  };

  public readonly updateDefaultAccountCenter = async (accountCenter: Partial<AccountCenter>) => {
    return this.updateById(id, accountCenter, 'replace');
  };
}
