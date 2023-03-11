import { createQueryClient } from '@withtyped/postgres';

import { EnvSet } from '#src/env-set/index.js';
import { parseDsn } from '#src/utils/postgres.js';

import { createApplicationsQueries } from './application.js';
import { createTenantsQueries } from './tenants.js';
import { createUsersQueries } from './users.js';

export class Queries {
  static default = new Queries();

  public readonly client = createQueryClient(parseDsn(EnvSet.global.dbUrl));
  public readonly tenants = createTenantsQueries(this.client);
  public readonly users = createUsersQueries(this.client);
  public readonly applications = createApplicationsQueries(this.client);
}
