import type Client from '@withtyped/client';
import type { BaseRoutes, Router } from '@withtyped/server';

import { type SmsConnector, type EmailConnector } from './passwordless.js';
import { type SocialConnector } from './social.js';

export * from './config-form.js';
export * from './error.js';
export * from './metadata.js';
export * from './foundation.js';
export * from './passwordless.js';
export * from './social.js';

export type GetConnectorConfig = (id: string) => Promise<unknown>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GetCloudServiceClient<T extends Router<any, any, BaseRoutes, string>> = () => Promise<
  Client<T>
>;

export type CreateConnector<
  T extends AllConnector,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  U extends Router<any, any, BaseRoutes, string> = Router<any, any, BaseRoutes, string>,
> = (options: {
  getConfig: GetConnectorConfig;
  getCloudServiceClient?: GetCloudServiceClient<U>;
}) => Promise<T>;

export type AllConnector = SmsConnector | EmailConnector | SocialConnector;

export enum DemoConnector {
  Sms = 'logto-sms',
  Social = 'logto-social-demo',
}

export const demoConnectorIds: readonly string[] = Object.freeze([
  DemoConnector.Sms,
  DemoConnector.Social,
]);

export enum ServiceConnector {
  Email = 'logto-email',
}

export const serviceConnectorIds: readonly string[] = Object.freeze([ServiceConnector.Email]);
