import {
  type CreateSsoConnector,
  type SsoConnector,
  type SsoConnectorIdpInitiatedAuthConfig,
  SsoConnectorIdpInitiatedAuthConfigs,
  type SsoConnectorKeys,
  SsoConnectors,
  IdpInitiatedSamlSsoSessions,
} from '@logto/schemas';
import { sql, type CommonQueryMethods } from '@silverhand/slonik';

import SchemaQueries from '#src/utils/SchemaQueries.js';
import { convertToIdentifiers } from '#src/utils/sql.js';

import { buildDeleteByIdWithPool } from '../database/delete-by-id.js';
import { buildInsertIntoWithPool } from '../database/insert-into.js';
import { buildUpdateWhereWithPool } from '../database/update-where.js';
import { DeletionError } from '../errors/SlonikError/index.js';

const {
  table: SsoConnectorIdpInitiatedAuthConfigsTable,
  fields: SsoConnectorIdpInitiatedAuthConfigsFields,
} = convertToIdentifiers(SsoConnectorIdpInitiatedAuthConfigs);

export default class SsoConnectorQueries extends SchemaQueries<
  SsoConnectorKeys,
  CreateSsoConnector,
  SsoConnector
> {
  public readonly insertIdpInitiatedAuthConfig = buildInsertIntoWithPool(this.pool)(
    SsoConnectorIdpInitiatedAuthConfigs,
    {
      returning: true,
      onConflict: {
        fields: [
          SsoConnectorIdpInitiatedAuthConfigsFields.connectorId,
          SsoConnectorIdpInitiatedAuthConfigsFields.tenantId,
        ],
        setExcludedFields: [
          SsoConnectorIdpInitiatedAuthConfigsFields.defaultApplicationId,
          SsoConnectorIdpInitiatedAuthConfigsFields.redirectUri,
          SsoConnectorIdpInitiatedAuthConfigsFields.authParameters,
        ],
      },
    }
  );

  public readonly updateIdpInitiatedAuthConfig = buildUpdateWhereWithPool(this.pool)(
    SsoConnectorIdpInitiatedAuthConfigs,
    true
  );

  public readonly insertIdpInitiatedSamlSsoSession = buildInsertIntoWithPool(this.pool)(
    IdpInitiatedSamlSsoSessions,
    {
      returning: true,
    }
  );

  public readonly deleteIdpInitiatedSamlSsoSessionById = buildDeleteByIdWithPool(
    this.pool,
    IdpInitiatedSamlSsoSessions.table
  );

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

  async getIdpInitiatedAuthConfigByConnectorId(connectorId: string) {
    return this.pool.maybeOne<SsoConnectorIdpInitiatedAuthConfig>(sql`
      SELECT * FROM ${SsoConnectorIdpInitiatedAuthConfigsTable}
      WHERE ${SsoConnectorIdpInitiatedAuthConfigsFields.connectorId}=${connectorId}
    `);
  }

  async deleteIdpInitiatedAuthConfigByConnectorId(connectorId: string) {
    const { rowCount } = await this.pool.query(sql`
      DELETE FROM ${SsoConnectorIdpInitiatedAuthConfigsTable}
      WHERE ${SsoConnectorIdpInitiatedAuthConfigsFields.connectorId}=${connectorId}
    `);

    if (rowCount < 1) {
      throw new DeletionError(SsoConnectorIdpInitiatedAuthConfigs.table);
    }
  }
}
