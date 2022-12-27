import type { AllConnector, CreateConnector, MessageTypes } from '@logto/connector-kit';
import type { Connector } from '@logto/schemas';
import { z } from 'zod';

export { ConnectorType } from '@logto/schemas';

export type TemplateType = MessageTypes;

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
export type ConnectorFactory<T extends AllConnector = AllConnector> = Pick<
  T,
  'type' | 'metadata'
> & {
  createConnector: CreateConnector<AllConnector>;
  path: string;
};

/**
 * The connector type with full context.
 */
export type LogtoConnector<T extends AllConnector = AllConnector> = T & {
  validateConfig: (config: unknown) => void;
} & { dbEntry: Connector };
