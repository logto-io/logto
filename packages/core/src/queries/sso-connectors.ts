import {
  type CreateSsoConnector,
  type SsoConnector,
  type SsoConnectorKeys,
  SsoConnectors,
} from '@logto/schemas';
import { convertToIdentifiers } from '@logto/shared';
import { sql, type CommonQueryMethods } from 'slonik';

import SchemaQueries from '#src/utils/SchemaQueries.js';

export default class SsoConnectorQueries extends SchemaQueries<
  SsoConnectorKeys,
  CreateSsoConnector,
  SsoConnector
> {
  constructor(pool: CommonQueryMethods) {
    super(pool, SsoConnectors);
  }

  async findByConnectorName(connectorName: string) {
    const { table, fields } = convertToIdentifiers(SsoConnectors);

    return this.pool.maybeOne<SsoConnector>(sql`
      SELECT * FROM ${table}
      where ${fields.connectorName}=${connectorName}
    `);
  }
}
