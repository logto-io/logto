import { GeneralConnector } from '@logto/connector-core';
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

export type LogtoConnector = Required<GeneralConnector> & {
  dbEntry: Connector;
  validateConfig: (config: unknown) => void;
};
