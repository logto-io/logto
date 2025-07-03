import { z } from 'zod';

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

export const socialConnectorTokenSetMetadataGuard = z.object({
  scope: z.string().optional(),
  expiresAt: z.number().optional(),
  tokenType: z.string().optional(),
});

export type SocialConnectorTokenSetMetadata = z.infer<typeof socialConnectorTokenSetMetadataGuard>;

export const encryptedTokenSetGuard = z.object({
  encryptedTokenSetBase64: z.string(),
  metadata: socialConnectorTokenSetMetadataGuard,
});

export type EncryptedTokenSet = z.infer<typeof encryptedTokenSetGuard>;

export type CreateSocialTokenSetSecret = CreateSecret & {
  metadata: SocialConnectorTokenSetMetadata;
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

export const socialTokenSetSecretGuard = Secrets.guard.extend({
  type: z.literal(SecretType.FederatedTokenSet),
  metadata: socialConnectorTokenSetMetadataGuard,
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
