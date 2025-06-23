import crypto from 'node:crypto';

import { type TokenRecord, tokenRecrodGuard, type EncryptedSecret } from '@logto/schemas';

import { EnvSet } from '../env-set/index.js';

import assertThat from './assert-that.js';

const ecryptionMethod = 'aes-256-gcm';

const encryprSecret = (plainTextSecret: string): EncryptedSecret => {
  assertThat(
    EnvSet.values.secretVaultKek,
    new Error(
      'The key encryption key (KEK) for the secret vault is not set. Please set the `SECRET_VAULT_KEK` environment variable.'
    )
  );

  const kek = Buffer.from(EnvSet.values.secretVaultKek, 'base64');

  // 1. genretate a Data Encryption Key (DEK)
  const dek = crypto.randomBytes(32);

  // 2. Encrypt the secret with the DEK (AES-256-GCM)

  // Generate a random IV (initialization vector) for AES-GCM
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ecryptionMethod, dek, iv);
  const ciphertext = Buffer.concat([cipher.update(plainTextSecret, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // 3. Encrypt the DEK with the KEK (AES-256-GCM)
  const ivDek = crypto.randomBytes(12);
  const dekCipher = crypto.createCipheriv(ecryptionMethod, kek, ivDek);
  const encryptedDek = Buffer.concat([dekCipher.update(dek), dekCipher.final()]);
  const dekAuthTag = dekCipher.getAuthTag();

  return {
    iv,
    authTag,
    ciphertext,
    encryptedDek: Buffer.concat([ivDek, encryptedDek, dekAuthTag]),
  };
};

const decriptSecret = ({ iv, authTag, ciphertext, encryptedDek }: EncryptedSecret): string => {
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

  const dekDecipher = crypto.createDecipheriv(ecryptionMethod, kek, ivDek);
  dekDecipher.setAuthTag(dekAuthTag);
  const dek = Buffer.concat([dekDecipher.update(_encryptedDek), dekDecipher.final()]);

  // 2. Decrypt the secret with the DEK
  const decipher = crypto.createDecipheriv(ecryptionMethod, dek, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
};

export const encryptTokens = (tokens: TokenRecord): EncryptedSecret => {
  const tokensString = JSON.stringify(tokens);
  return encryprSecret(tokensString);
};

export const decryptTokens = (encryptedSecret: EncryptedSecret): TokenRecord => {
  const decryptedString = decriptSecret(encryptedSecret);
  return tokenRecrodGuard.parse(JSON.parse(decryptedString));
};
