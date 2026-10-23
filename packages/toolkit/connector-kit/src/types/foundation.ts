import type { ZodType, z } from 'zod';

import { type ConnectorMetadata } from './metadata.js';

export enum ConnectorType {
  Email = 'Email',
  Sms = 'Sms',
  Social = 'Social',
}

/* 
  SocialConnector, EmailConnector, SmsConnector has dependency on BaseConnector,
  so BaseConnector need be defined separately.
*/
export type BaseConnector<Type extends ConnectorType> = {
  type: Type;
  metadata: ConnectorMetadata;
  configGuard: ZodType;
};

/**
 * Asserts that a zod object guard covers every key of `T` and parses each into `T[K]`. Only the
 * output is constrained, so a field guard may normalize its input (e.g. via `z.preprocess`).
 */
export type ToZodObject<T> = z.ZodObject<{
  [K in keyof T]-?: z.ZodType<T[K], z.ZodTypeDef, unknown>;
}>;
