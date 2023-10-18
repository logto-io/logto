import type { ZodType } from 'zod';

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
