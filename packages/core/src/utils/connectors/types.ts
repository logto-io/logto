import type { AllConnector, CreateConnector, VerificationCodeType } from '@logto/connector-kit';
import type { Connector } from '@logto/schemas';

export { ConnectorType } from '@logto/schemas';

export type TemplateType = VerificationCodeType;

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
