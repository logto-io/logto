import { SmsConnector, EmailConnector, SocialConnector } from '@logto/connector-types';
import { PasscodeType } from '@logto/schemas';
import { z } from 'zod';

export { ConnectorType } from '@logto/schemas';
export type { ConnectorMetadata } from '@logto/schemas';

// The name `Connector` is used for database, use `ConnectorInstance` to avoid confusing.
export type IConnector = SmsConnector | EmailConnector | SocialConnector;

export type TemplateType = PasscodeType | 'Test';

export const socialUserInfoGuard = z.object({
  id: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  name: z.string().optional(),
  avatar: z.string().optional(),
});

export type SocialUserInfo = z.infer<typeof socialUserInfoGuard>;
