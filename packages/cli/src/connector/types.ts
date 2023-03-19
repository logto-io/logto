import type { AllConnector, CreateConnector } from '@logto/connector-kit';

/**
 * Dynamic loaded connector type.
 */
export type ConnectorFactory<T extends AllConnector = AllConnector> = Pick<
  T,
  'type' | 'metadata'
> & {
  createConnector: CreateConnector<T>;
  path: string;
};

export type ConnectorPackage = {
  name: string;
  path: string;
};
