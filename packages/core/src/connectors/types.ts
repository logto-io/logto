import { SmsConnector, EmailConnector, SocialConnector } from '@logto/connector-types';
import { Connector, PasscodeType } from '@logto/schemas';
import { z } from 'zod';

export { ConnectorType } from '@logto/schemas';
export type { ConnectorMetadata } from '@logto/schemas';

// The name `Connector` is used for database, use `ConnectorInstance` to avoid confusing.
export type IConnector<T = unknown> = SmsConnector<T> | EmailConnector<T> | SocialConnector<T>;
export type ConnectorInstance =
  | SmsConnectorInstance
  | EmailConnectorInstance
  | SocialConnectorInstance;

export type SmsConnectorInstance<T = unknown> = SmsConnector<T> & { connector: Connector };

export type EmailConnectorInstance<T = unknown> = EmailConnector<T> & { connector: Connector };

export type SocialConnectorInstance<T = unknown> = SocialConnector<T> & { connector: Connector };

export type TemplateType = PasscodeType | 'Test';

export const socialUserInfoGuard = z.object({
  id: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  name: z.string().optional(),
  avatar: z.string().optional(),
});

export type SocialUserInfo = z.infer<typeof socialUserInfoGuard>;
