import { AllConnector } from '@logto/connector-kit';
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

/**
 * Dynamic loaded connector type.
 */
export type LoadConnector<T extends AllConnector = AllConnector> = T & {
  validateConfig: (config: unknown) => void;
};

/**
 * The connector type with full context.
 */
export type LogtoConnector<T extends AllConnector = AllConnector> = LoadConnector<T> & {
  dbEntry: Connector;
};

export const npmPackResultGuard = z
  .object({
    name: z.string(),
    version: z.string(),
    filename: z.string(),
  })
  .array();
