import { LogtoConnector } from '@logto/connector-schemas';
import { Connector, PasscodeType } from '@logto/schemas';
import { z } from 'zod';

export type TemplateType = PasscodeType | 'Test';

export const socialUserInfoGuard = z.object({
  id: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  name: z.string().optional(),
  avatar: z.string().optional(),
});

export type SocialUserInfo = z.infer<typeof socialUserInfoGuard>;

export class ConnectorInstance<T = unknown> extends LogtoConnector<T> {
  public connector!: Connector;
}
