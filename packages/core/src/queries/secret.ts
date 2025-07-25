import {
  type CreateSecret,
  type CreateSocialTokenSetSecret,
  type EnterpriseSsoTokenSetSecret,
  type Secret,
  type SecretEnterpriseSsoConnectorRelationPayload,
  SecretEnterpriseSsoConnectorRelations,
  type SecretKeys,
  Secrets,
  type SecretSocialConnectorRelationPayload,
  SecretSocialConnectorRelations,
  SecretType,
  type SocialTokenSetSecret,
} from '@logto/schemas';
import { sql, type CommonQueryMethods } from '@silverhand/slonik';

import { buildInsertIntoWithPool } from '../database/insert-into.js';
import SchemaQueries from '../utils/SchemaQueries.js';
import { convertToIdentifiers } from '../utils/sql.js';

const secrets = convertToIdentifiers(Secrets, true);
const secretSocialConnectorRelations = convertToIdentifiers(SecretSocialConnectorRelations, true);
const secretEnterpriseSsoConnectorRelations = convertToIdentifiers(
  SecretEnterpriseSsoConnectorRelations,
  true
);

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

      return newSecret;
    });
  }

  /**
   * For user federated token exchange use, we need to find the secret by user id and social target.
   */
  public async findSocialTokenSetSecretByUserIdAndTarget(userId: string, target: string) {
    return this.pool.maybeOne<SocialTokenSetSecret>(sql`
        select ${sql.join(Object.values(secrets.fields), sql`, `)},
          ${secretSocialConnectorRelations.fields.connectorId},
          ${secretSocialConnectorRelations.fields.identityId},
          ${secretSocialConnectorRelations.fields.target}
        from ${secrets.table}
        join ${secretSocialConnectorRelations.table}
          on ${secrets.fields.id} = ${secretSocialConnectorRelations.fields.secretId}
        where ${secrets.fields.userId} = ${userId}
          and ${secrets.fields.type} = ${SecretType.FederatedTokenSet}
          and ${secretSocialConnectorRelations.fields.target} = ${target}
    `);
  }

  public async upsertEnterpriseSsoTokenSetSecret(
    secret: Omit<CreateSocialTokenSetSecret, 'type'>,
    ssoConnectorRelationPayload: SecretEnterpriseSsoConnectorRelationPayload
  ) {
    return this.pool.transaction(async (transaction) => {
      // Delete any existing secret for the same identity and issuer
      // This is to ensure only one secret exists for a given identity
      await transaction.query(sql`
        delete from ${secrets.table}
        using ${secretEnterpriseSsoConnectorRelations.table}
        where ${secrets.fields.id} = ${secretEnterpriseSsoConnectorRelations.fields.secretId}
          and ${secrets.fields.userId} = ${secret.userId}
          and ${secretEnterpriseSsoConnectorRelations.fields.issuer} = ${ssoConnectorRelationPayload.issuer}
      `);

      // Insert new secrets
      const insertInto = buildInsertIntoWithPool(transaction)(Secrets, { returning: true });
      const newSecret = await insertInto({
        ...secret,
        type: SecretType.FederatedTokenSet,
      });

      // Insert enterprise SSO connector relation
      const insertEnterpriseSsoRelations = buildInsertIntoWithPool(transaction)(
        SecretEnterpriseSsoConnectorRelations
      );
      await insertEnterpriseSsoRelations({
        secretId: newSecret.id,
        ...ssoConnectorRelationPayload,
      });
    });
  }

  /**
   * For user federated token exchange use, we need to find the secret by user id and SSO connector.
   */
  public async findEnterpriseSsoTokenSetSecretByUserIdAndConnectorId(
    userId: string,
    ssoConnectorId: string
  ) {
    return this.pool.maybeOne<EnterpriseSsoTokenSetSecret>(sql`
      select ${sql.join(Object.values(secrets.fields), sql`, `)},
          ${secretEnterpriseSsoConnectorRelations.fields.ssoConnectorId},
          ${secretEnterpriseSsoConnectorRelations.fields.identityId},
          ${secretEnterpriseSsoConnectorRelations.fields.issuer}
        from ${secrets.table}
        join ${secretEnterpriseSsoConnectorRelations.table}
          on ${secrets.fields.id} = ${secretEnterpriseSsoConnectorRelations.fields.secretId}
        where ${secrets.fields.userId} = ${userId}
          and ${secrets.fields.type} = ${SecretType.FederatedTokenSet}
          and ${secretEnterpriseSsoConnectorRelations.fields.ssoConnectorId} = ${ssoConnectorId}
    `);
  }

  public async findSocialTokenSetSecretsByUserId(userId: string) {
    return this.pool.any<SocialTokenSetSecret>(sql`
      select ${sql.join(Object.values(secrets.fields), sql`, `)},
          ${secretSocialConnectorRelations.fields.connectorId},
          ${secretSocialConnectorRelations.fields.identityId},
          ${secretSocialConnectorRelations.fields.target}
        from ${secrets.table}
        join ${secretSocialConnectorRelations.table}
          on ${secrets.fields.id} = ${secretSocialConnectorRelations.fields.secretId}
        where ${secrets.fields.userId} = ${userId}
          and ${secrets.fields.type} = ${SecretType.FederatedTokenSet}
    `);
  }

  public async findEnterpriseSsoTokenSetSecretsByUserId(userId: string) {
    return this.pool.any<EnterpriseSsoTokenSetSecret>(sql`
      select ${sql.join(Object.values(secrets.fields), sql`, `)},
          ${secretEnterpriseSsoConnectorRelations.fields.ssoConnectorId},
          ${secretEnterpriseSsoConnectorRelations.fields.identityId},
          ${secretEnterpriseSsoConnectorRelations.fields.issuer}
        from ${secrets.table}
        join ${secretEnterpriseSsoConnectorRelations.table}
          on ${secrets.fields.id} = ${secretEnterpriseSsoConnectorRelations.fields.secretId}
        where ${secrets.fields.userId} = ${userId}
          and ${secrets.fields.type} = ${SecretType.FederatedTokenSet}
    `);
  }

  public async deleteTokenSetSecretsBySocialConnectorId(connectorId: string) {
    return this.pool.query(sql`
      delete from ${secrets.table}
      using ${secretSocialConnectorRelations.table}
      where ${secrets.fields.id} = ${secretSocialConnectorRelations.fields.secretId}
        and ${secretSocialConnectorRelations.fields.connectorId} = ${connectorId}
    `);
  }

  public async deleteTokenSetSecretsByEnterpriseSsoConnectorId(ssoConnectorId: string) {
    return this.pool.query(sql`
      delete from ${secrets.table}
      using ${secretEnterpriseSsoConnectorRelations.table}
      where ${secrets.fields.id} = ${secretEnterpriseSsoConnectorRelations.fields.secretId}
        and ${secretEnterpriseSsoConnectorRelations.fields.ssoConnectorId} = ${ssoConnectorId}
    `);
  }
}

export default SecretQueries;
