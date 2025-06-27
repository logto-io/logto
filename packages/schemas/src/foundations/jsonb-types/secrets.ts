import { z } from 'zod';

export enum SecretType {
  /**
   * A federated token set is a collection of OAuth tokens from the third-party providers.
   * Use these tokens to get access to the third-party APIs.
   */
  FederatedTokenSet = 'federated_token_set',
}

export const secretTypeGuard = z.nativeEnum(SecretType);

export type BufferLike = Buffer;

export const bufferLikeGuard = z.custom<BufferLike>(
  (value) => {
    return Buffer.isBuffer(value);
  },
  {
    message: 'Invalid Buffer instance',
  }
);
