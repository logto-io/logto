import { createQueryClient } from '@withtyped/postgres';

import { EnvSet } from '#src/env-set/index.js';
import { parseDsn } from '#src/utils/postgres.js';

import { createApplicationsQueries } from './application.js';
import { createConnectorsQuery } from './connector.js';
import { createServiceLogsQueries } from './service-logs.js';
import { createSystemsQuery } from './system.js';
import { createTenantsQueries } from './tenants.js';
import { createUsersQueries } from './users.js';

export class Queries {
  static default = new Queries();

  public readonly client = createQueryClient(parseDsn(EnvSet.global.dbUrl));
  public readonly tenants = createTenantsQueries(this.client);
  public readonly users = createUsersQueries(this.client);
  public readonly applications = createApplicationsQueries(this.client);
  public readonly connectors = createConnectorsQuery(this.client);
  public readonly serviceLogs = createServiceLogsQueries(this.client);
  public readonly systems = createSystemsQuery(this.client);
}
