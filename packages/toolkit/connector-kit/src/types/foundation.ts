import type { ZodType } from 'zod';

import { type ConnectorMetadata } from './metadata.js';

export enum ConnectorType {
  Email = 'Email',
  Sms = 'Sms',
  Social = 'Social',
  SsoOidc = 'SsoOidc',
  SsoSaml = 'SsoSaml',
}

/* 
  SocialConnector, EmailConnector, SmsConnector has dependency on BaseConnector,
  so BaseConnector need be defined separately.
*/
export type BaseConnector<
  Type extends ConnectorType,
  MetadataType extends ConnectorMetadata = ConnectorMetadata,
> = {
  type: Type;
  metadata: MetadataType;
  configGuard: ZodType;
};
