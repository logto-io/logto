import crypto from 'node:crypto';

import { type TokenSet, tokenSetGuard, type EncryptedSecret } from '@logto/schemas';
import { z } from 'zod';

import { EnvSet } from '../env-set/index.js';

import assertThat from './assert-that.js';

const encryptionMethod = 'aes-256-gcm';

const encryptSecret = (plainTextSecret: string): EncryptedSecret => {
  assertThat(
    EnvSet.values.secretVaultKek,
    new Error(
      'The key encryption key (KEK) for the secret vault is not set. Please set the `SECRET_VAULT_KEK` environment variable.'
    )
  );

  const kek = Buffer.from(EnvSet.values.secretVaultKek, 'base64');

  // 1. generate a Data Encryption Key (DEK)
  const dek = crypto.randomBytes(32);

  // 2. Encrypt the secret with the DEK (AES-256-GCM)

  // Generate a random IV (initialization vector) for AES-GCM
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(encryptionMethod, dek, iv);
  const ciphertext = Buffer.concat([cipher.update(plainTextSecret, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // 3. Encrypt the DEK with the KEK (AES-256-GCM)
  const ivDek = crypto.randomBytes(12);
  const dekCipher = crypto.createCipheriv(encryptionMethod, kek, ivDek);
  const encryptedDek = Buffer.concat([dekCipher.update(dek), dekCipher.final()]);
  const dekAuthTag = dekCipher.getAuthTag();

  return {
    iv,
    authTag,
    ciphertext,
    encryptedDek: Buffer.concat([ivDek, encryptedDek, dekAuthTag]),
  };
};

const decryptSecret = ({ iv, authTag, ciphertext, encryptedDek }: EncryptedSecret): string => {
  assertThat(
    EnvSet.values.secretVaultKek,
    new Error('The key encryption key (KEK) for the secret vault is not found.')
  );

  const kek = Buffer.from(EnvSet.values.secretVaultKek, 'base64');

  // 1. Extract IV and authTag for DEK
  // The first 12 bytes of `encryptedDek` is the IV
  const ivDek = encryptedDek.subarray(0, 12);
  // The last 16 bytes of `encryptedDek` is the authTag
  const dekAuthTag = encryptedDek.subarray(-16, encryptedDek.length);
  // The rest is the encrypted DEK
  const _encryptedDek = encryptedDek.subarray(12, -16);

  const dekDecipher = crypto.createDecipheriv(encryptionMethod, kek, ivDek);
  dekDecipher.setAuthTag(dekAuthTag);
  const dek = Buffer.concat([dekDecipher.update(_encryptedDek), dekDecipher.final()]);

  // 2. Decrypt the secret with the DEK
  const decipher = crypto.createDecipheriv(encryptionMethod, dek, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
};

export const encryptTokens = (tokens: TokenSet): EncryptedSecret => {
  const tokensString = JSON.stringify(tokens);
  return encryptSecret(tokensString);
};

export const decryptTokens = (encryptedSecret: EncryptedSecret): TokenSet => {
  const decryptedString = decryptSecret(encryptedSecret);
  return tokenSetGuard.parse(JSON.parse(decryptedString));
};

const serializedEncryptedSecretGuard = z.object({
  iv: z.string(),
  authTag: z.string(),
  ciphertext: z.string(),
  encryptedDek: z.string(),
});

/**
 * Serializes an {@link EncryptedSecret} object to a base64 string.
 */
export const serializeEncryptedSecret = (encryptedSecret: EncryptedSecret): string => {
  const serialized = Object.fromEntries(
    Object.entries(encryptedSecret).map(([key, value]) => [key, value.toString('base64')])
  );

  const jsonString = JSON.stringify(serialized);

  return Buffer.from(jsonString).toString('base64');
};

/**
 * Deserializes a base64 string to an {@link EncryptedSecret} object.
 */
export const deserializeEncryptedSecret = (base64String: string): EncryptedSecret => {
  const jsonString = Buffer.from(base64String, 'base64').toString('utf8');
  const serialized = serializedEncryptedSecretGuard.parse(JSON.parse(jsonString));

  return {
    iv: Buffer.from(serialized.iv, 'base64'),
    authTag: Buffer.from(serialized.authTag, 'base64'),
    ciphertext: Buffer.from(serialized.ciphertext, 'base64'),
    encryptedDek: Buffer.from(serialized.encryptedDek, 'base64'),
  };
};
