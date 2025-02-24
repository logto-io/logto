import type Client from '@withtyped/client';
import type { BaseRoutes, Router } from '@withtyped/server';

import { type EmailTemplateDetails } from './email-template.js';
import { type SmsConnector, type EmailConnector, type TemplateType } from './passwordless.js';
import { type SocialConnector } from './social.js';

export * from './config-form.js';
export * from './error.js';
export * from './metadata.js';
export * from './foundation.js';
export * from './passwordless.js';
export * from './social.js';
export * from './email-template.js';

export type GetConnectorConfig = (id: string) => Promise<unknown>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GetCloudServiceClient<T extends Router<any, any, BaseRoutes, string>> = () => Promise<
  Client<T>
>;

/**
 * Get the custom i18n template for the email connector.
 *
 * @param {TemplateType} templateType - The type of the template. e.g. 'SignIn'
 * @param {string} [languageTag] - The preferred language tag of the template. e.g. 'en-US'
 *
 * @remarks
 * Available for email connectors only.
 * If not provided, or the language template returns undefined,
 * the connector should fallback to the default template settings
 * located in the email connector configuration.
 */
export type GetI18nEmailTemplate = (
  templateType: TemplateType,
  languageTag?: string
) => Promise<EmailTemplateDetails | undefined>;

export type CreateConnector<
  T extends AllConnector,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  U extends Router<any, any, BaseRoutes, string> = Router<any, any, BaseRoutes, string>,
> = (options: {
  getConfig: GetConnectorConfig;
  getCloudServiceClient?: GetCloudServiceClient<U>;
  getI18nEmailTemplate?: T extends EmailConnector ? GetI18nEmailTemplate : undefined;
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
