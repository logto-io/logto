import { tokenResponseGuard } from '@logto/connector-kit';
import { z } from 'zod';

import { SecretEnterpriseSsoConnectorRelations } from '../db-entries/secret-enterprise-sso-connector-relation.js';
import { SecretSocialConnectorRelations } from '../db-entries/secret-social-connector-relation.js';
import { type CreateSecret, Secrets } from '../db-entries/secret.js';
import { SecretType } from '../foundations/index.js';

export const encryptedSecretGuard = Secrets.guard.pick({
  encryptedDek: true,
  iv: true,
  authTag: true,
  ciphertext: true,
});

export type EncryptedSecret = z.infer<typeof encryptedSecretGuard>;

export const tokenSetGuard = z.object({
  id_token: z.string().optional(),
  access_token: z.string(),
  refresh_token: z.string().optional(),
});

export type TokenSet = z.infer<typeof tokenSetGuard>;

export const tokenSetMetadataGuard = z.object({
  scope: z.string().optional(),
  expiresAt: z.number().optional(),
  tokenType: z.string().optional(),
  hasRefreshToken: z.boolean(),
});

export type TokenSetMetadata = z.infer<typeof tokenSetMetadataGuard>;

export const encryptedTokenSetGuard = z.object({
  encryptedTokenSetBase64: z.string(),
  metadata: tokenSetMetadataGuard,
});

export type EncryptedTokenSet = z.infer<typeof encryptedTokenSetGuard>;

export type CreateSocialTokenSetSecret = CreateSecret & {
  metadata: TokenSetMetadata;
};

export const secretSocialConnectorRelationPayloadGuard =
  SecretSocialConnectorRelations.createGuard.pick({
    connectorId: true,
    target: true,
    identityId: true,
  });

export type SecretSocialConnectorRelationPayload = z.infer<
  typeof secretSocialConnectorRelationPayloadGuard
>;

export const secretEnterpriseSsoConnectorRelationPayloadGuard =
  SecretEnterpriseSsoConnectorRelations.createGuard.pick({
    ssoConnectorId: true,
    issuer: true,
    identityId: true,
  });

export type SecretEnterpriseSsoConnectorRelationPayload = z.infer<
  typeof secretEnterpriseSsoConnectorRelationPayloadGuard
>;

export const socialTokenSetSecretGuard = Secrets.guard.extend({
  type: z.literal(SecretType.FederatedTokenSet),
  metadata: tokenSetMetadataGuard,
  connectorId: z.string(),
  identityId: z.string(),
  target: z.string(),
});

/**
 * Social token set secret type
 * - Secret type is `FederatedTokenSet`
 * - Metadata is the social connector token set metadata
 * - Joined with the social connector relation
 */
export type SocialTokenSetSecret = z.infer<typeof socialTokenSetSecretGuard>;

export const desensitizedSocialTokenSetSecretGuard = socialTokenSetSecretGuard.omit({
  encryptedDek: true,
  iv: true,
  authTag: true,
  ciphertext: true,
});

export type DesensitizedSocialTokenSetSecret = z.infer<
  typeof desensitizedSocialTokenSetSecretGuard
>;

export const enterpriseSsoTokenSetSecretGuard = Secrets.guard.extend({
  type: z.literal(SecretType.FederatedTokenSet),
  metadata: tokenSetMetadataGuard,
  ssoConnectorId: z.string(),
  issuer: z.string(),
  identityId: z.string(),
});

/**
 * Enterprise SSO token set secret type
 * - Secret type is `FederatedTokenSet`
 * - Metadata is the Enterprise SSO connector token set metadata
 * - Joined with the Enterprise SSO connector relation
 */
export type EnterpriseSsoTokenSetSecret = z.infer<typeof enterpriseSsoTokenSetSecretGuard>;

export const desensitizedEnterpriseSsoTokenSetSecretGuard = enterpriseSsoTokenSetSecretGuard.omit({
  encryptedDek: true,
  iv: true,
  authTag: true,
  ciphertext: true,
});

export type DesensitizedEnterpriseSsoTokenSetSecret = z.infer<
  typeof desensitizedEnterpriseSsoTokenSetSecretGuard
>;

export type DesensitizedTokenSetSecret<
  T extends SocialTokenSetSecret | EnterpriseSsoTokenSetSecret,
> = Omit<T, 'encryptedDek' | 'iv' | 'authTag' | 'ciphertext'>;

export const getThirdPartyAccessTokenResponseGuard = tokenResponseGuard
  .pick({
    access_token: true,
    scope: true,
    token_type: true,
    expires_in: true,
  })
  .extend({
    access_token: z.string(),
  });

export type GetThirdPartyAccessTokenResponse = z.infer<
  typeof getThirdPartyAccessTokenResponseGuard
>;
