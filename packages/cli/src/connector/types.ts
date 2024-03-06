import type { AllConnector, CreateConnector } from '@logto/connector-kit';
import type { BaseRoutes, Router } from '@withtyped/server';

/**
 * Dynamic loaded connector type.
 */
export type ConnectorFactory<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Router<any, any, BaseRoutes, string>,
  U extends AllConnector = AllConnector,
> = Pick<U, 'type' | 'metadata' | 'configGuard'> & {
  createConnector: CreateConnector<U, T>;
  path: string;
};

export type ConnectorPackage = {
  name: string;
  path: string;
};
