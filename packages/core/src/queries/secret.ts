import {
  type CreateSecret,
  type CreateSocialTokenSetSecret,
  type Secret,
  type SecretKeys,
  Secrets,
  type SecretSocialConnectorRelationPayload,
  SecretSocialConnectorRelations,
  SecretType,
} from '@logto/schemas';
import { sql, type CommonQueryMethods } from '@silverhand/slonik';

import { buildInsertIntoWithPool } from '../database/insert-into.js';
import SchemaQueries from '../utils/SchemaQueries.js';
import { convertToIdentifiers } from '../utils/sql.js';

const secrets = convertToIdentifiers(Secrets);
const secretSocialConnectorRelations = convertToIdentifiers(SecretSocialConnectorRelations);

class SecretQueries extends SchemaQueries<SecretKeys, CreateSecret, Secret> {
  constructor(pool: CommonQueryMethods) {
    super(pool, Secrets);
  }

  /**
   * Upsert a social token set secret
   *
   * - If a secret already exists for the same social target and identity, it will be deleted.
   * - Insert a new secret with the provided data.
   * - Insert a new social connector relation for the secret.
   */
  public async upsertSocialTokenSetSecret(
    secret: Omit<CreateSocialTokenSetSecret, 'type'>,
    socialConnectorRelationPayload: SecretSocialConnectorRelationPayload
  ) {
    return this.pool.transaction(async (transaction) => {
      // Delete any existing secret for the same social target and identity
      // This is to ensure only one secret exists for a given social target and identity
      await transaction.query(sql`
        delete from ${secrets.table}
        using ${secretSocialConnectorRelations.table}
        where ${secrets.fields.id} = ${secretSocialConnectorRelations.fields.secretId}
          and ${secrets.fields.userId} = ${secret.userId}
          and ${secretSocialConnectorRelations.fields.target} = ${socialConnectorRelationPayload.target}
      `);

      // Insert new secrets
      const insertInto = buildInsertIntoWithPool(transaction)(Secrets, { returning: true });
      const newSecret = await insertInto({
        ...secret,
        type: SecretType.FederatedTokenSet,
      });

      // Insert social connector relation
      const insertSocialConnectorRelations = buildInsertIntoWithPool(transaction)(
        SecretSocialConnectorRelations
      );
      await insertSocialConnectorRelations({
        secretId: newSecret.id,
        ...socialConnectorRelationPayload,
      });
    });
  }
}

export default SecretQueries;
