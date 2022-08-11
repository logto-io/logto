import { SmsConnector, EmailConnector, SocialConnector } from '@logto/connector-schemas';
import { PasscodeType, Connector } from '@logto/schemas';
import { z } from 'zod';

export { ConnectorType } from '@logto/schemas';
export type { ConnectorMetadata } from '@logto/schemas';

export type TemplateType = PasscodeType | 'Test';

export const socialUserInfoGuard = z.object({
  id: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  name: z.string().optional(),
  avatar: z.string().optional(),
});

export type SocialUserInfo = z.infer<typeof socialUserInfoGuard>;

export type SmsConnectorInstance = InstanceType<typeof SmsConnector> & { connector: Connector };

export type EmailConnectorInstance = InstanceType<typeof EmailConnector> & { connector: Connector };

export type SocialConnectorInstance = InstanceType<typeof SocialConnector> & {
  connector: Connector;
};

type ArbitraryConnector =
  | InstanceType<typeof SmsConnector>
  | InstanceType<typeof EmailConnector>
  | InstanceType<typeof SocialConnector>;

export type ConnectorInstance = ArbitraryConnector & { connector: Connector };
