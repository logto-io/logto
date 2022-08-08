import { SmsConnector, EmailConnector, SocialConnector } from '@logto/connector-base-classes';
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

export type Instance =
  | InstanceType<typeof SmsConnector>
  | InstanceType<typeof EmailConnector>
  | InstanceType<typeof SocialConnector>;

export type SmsConnectorInstance = {
  instance: InstanceType<typeof SmsConnector>;
  connector: Connector;
};

export type EmailConnectorInstance = {
  instance: InstanceType<typeof EmailConnector>;
  connector: Connector;
};

export type SocialConnectorInstance = {
  instance: InstanceType<typeof SocialConnector>;
  connector: Connector;
};

export type ConnectorInstance =
  | SmsConnectorInstance
  | EmailConnectorInstance
  | SocialConnectorInstance
  | { instance: Instance; connector: Connector };
