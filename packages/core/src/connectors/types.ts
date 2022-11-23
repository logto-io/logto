import type { AllConnector, CreateConnector } from '@logto/connector-kit';
import type { Connector, PasscodeType } from '@logto/schemas';
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

/**
 * Dynamic loaded connector type.
 */
export type VirtualConnector<T extends AllConnector = AllConnector> = T & {
  validateConfig: (config: unknown) => void;
};

export type VirtualConnectorFactory<T extends AllConnector = AllConnector> = Pick<
  T,
  'type' | 'metadata'
> & {
  createConnector: CreateConnector<AllConnector>;
  path: string;
};

/**
 * The connector type with full context.
 */
export type LogtoConnector<T extends AllConnector = AllConnector> = VirtualConnector<T> & {
  dbEntry: Connector;
};
