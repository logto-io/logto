import type { AllConnector, VerificationCodeType } from '@logto/connector-kit';
import type { Connector } from '@logto/schemas';

export { ConnectorType } from '@logto/schemas';

export type TemplateType = VerificationCodeType;

/**
 * The connector type with full context.
 */
export type LogtoConnector<T extends AllConnector = AllConnector> = T & {
  validateConfig: (config: unknown) => void;
} & { dbEntry: Connector };
