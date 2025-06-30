import { z } from 'zod';

import { SecretSocialConnectorRelations } from '../db-entries/secret-social-connector-relation.js';
import { type CreateSecret, Secrets } from '../db-entries/secret.js';

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
