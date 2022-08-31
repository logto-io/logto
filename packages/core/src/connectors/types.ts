import { AllConnector, BaseConnector, ConnectorType, EmailConnector } from '@logto/connector-core';
import { Connector, PasscodeType } from '@logto/schemas';
import { z } from 'zod';

export { ConnectorType } from '@logto/schemas';

export type TemplateType = PasscodeType | 'Test';

export const socialUserInfoGuard = z.object({
  id: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  name: z.string().optional(),
  avatar: z.string().optional(),
});

export type SocialUserInfo = z.infer<typeof socialUserInfoGuard>;

export type GeneralConnector =
  | BaseConnector<ConnectorType.Email>
  | BaseConnector<ConnectorType.Sms>
  | BaseConnector<ConnectorType.Social>;

type ExtractConnectorType<T extends GeneralConnector> = T extends BaseConnector<infer R>
  ? R
  : never;

export type LoadConnector<T extends AllConnector = AllConnector> = T & {
  validateConfig: (config: unknown) => void;
};

export type LogtoConnector<T extends AllConnector = AllConnector> = LoadConnector<T> & {
  dbEntry: Connector;
};
