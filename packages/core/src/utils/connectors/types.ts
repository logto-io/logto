import type { AllConnector, VerificationCodeType } from '@logto/connector-kit';
import { type Connector, Connectors } from '@logto/schemas';
import { type z } from 'zod';

export { ConnectorType } from '@logto/schemas';

export type TemplateType = VerificationCodeType;

/**
 * The connector type with full context.
 */
export type LogtoConnector<T extends AllConnector = AllConnector> = T & {
  validateConfig: (config: unknown) => void;
} & { dbEntry: Connector };

export const connectorWellKnownGuard = Connectors.guard.pick({
  id: true,
  metadata: true,
  connectorId: true,
});
export type ConnectorWellKnown = z.infer<typeof connectorWellKnownGuard>;

/**
 * The connector type with full context but no sensitive info.
 */
export type LogtoConnectorWellKnown<T extends AllConnector = AllConnector> = Pick<
  T,
  'type' | 'metadata'
> & {
  dbEntry: ConnectorWellKnown;
};
