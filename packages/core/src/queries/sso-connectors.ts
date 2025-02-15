import {
  type CreateSsoConnector,
  type SsoConnector,
  type SsoConnectorIdpInitiatedAuthConfig,
  SsoConnectorIdpInitiatedAuthConfigs,
  type SsoConnectorKeys,
  SsoConnectors,
  IdpInitiatedSamlSsoSessions,
  type IdpInitiatedSamlSsoSession,
} from '@logto/schemas';
import { sql, type CommonQueryMethods } from '@silverhand/slonik';

import SchemaQueries from '#src/utils/SchemaQueries.js';
import { convertToIdentifiers } from '#src/utils/sql.js';

import { buildDeleteByIdWithPool } from '../database/delete-by-id.js';
import { buildInsertIntoWithPool } from '../database/insert-into.js';
import { buildUpdateWhereWithPool } from '../database/update-where.js';
import { DeletionError } from '../errors/SlonikError/index.js';

const {
  table: ssoConnectorIdpInitiatedAuthConfigsTable,
  fields: ssoConnectorIdpInitiatedAuthConfigsFields,
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
          ssoConnectorIdpInitiatedAuthConfigsFields.connectorId,
          ssoConnectorIdpInitiatedAuthConfigsFields.tenantId,
        ],
        setExcludedFields: [
          ssoConnectorIdpInitiatedAuthConfigsFields.defaultApplicationId,
          ssoConnectorIdpInitiatedAuthConfigsFields.redirectUri,
          ssoConnectorIdpInitiatedAuthConfigsFields.authParameters,
          ssoConnectorIdpInitiatedAuthConfigsFields.clientIdpInitiatedAuthCallbackUri,
          ssoConnectorIdpInitiatedAuthConfigsFields.autoSendAuthorizationRequest,
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
      SELECT * FROM ${ssoConnectorIdpInitiatedAuthConfigsTable}
      WHERE ${ssoConnectorIdpInitiatedAuthConfigsFields.connectorId}=${connectorId}
    `);
  }

  async deleteIdpInitiatedAuthConfigByConnectorId(connectorId: string) {
    const { rowCount } = await this.pool.query(sql`
      DELETE FROM ${ssoConnectorIdpInitiatedAuthConfigsTable}
      WHERE ${ssoConnectorIdpInitiatedAuthConfigsFields.connectorId}=${connectorId}
    `);

    if (rowCount < 1) {
      throw new DeletionError(SsoConnectorIdpInitiatedAuthConfigs.table);
    }
  }

  async findIdpInitiatedSamlSsoSessionById(id: string) {
    const { table, fields } = convertToIdentifiers(IdpInitiatedSamlSsoSessions);
    return this.pool.maybeOne<IdpInitiatedSamlSsoSession>(sql`
      SELECT * FROM ${table}
      WHERE ${fields.id}=${id}
    `);
  }
}
