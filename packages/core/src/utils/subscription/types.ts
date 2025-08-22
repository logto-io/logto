import type router from '@logto/cloud/routes';
import { type ToZodObject } from '@logto/connector-kit';
import { conditional } from '@silverhand/essentials';
import { type RouterRoutes } from '@withtyped/client';
import { z, type ZodType } from 'zod';

import { EnvSet } from '../../env-set/index.js';

type GetRoutes = RouterRoutes<typeof router>['get'];
type PostRoutes = RouterRoutes<typeof router>['post'];

type RouteResponseType<T extends { search?: unknown; body?: unknown; response?: ZodType }> =
  z.infer<NonNullable<T['response']>>;
type RouteRequestBodyType<T extends { search?: unknown; body?: ZodType; response?: unknown }> =
  z.infer<NonNullable<T['body']>>;

/**
 * The subscription data is fetched from the Cloud API.
 * All the dates are in ISO 8601 format, we need to manually fix the type to string here.
 */
export type Subscription = Omit<
  RouteResponseType<GetRoutes['/api/tenants/my/subscription']>,
  'currentPeriodStart' | 'currentPeriodEnd'
> & {
  currentPeriodStart: string;
  currentPeriodEnd: string;
};

type CompleteSubscriptionUsage = RouteResponseType<GetRoutes['/api/tenants/my/subscription-usage']>;

/**
 * @remarks
 * The `auditLogsRetentionDays` will be handled by cron job in Azure Functions, outdated audit logs will be removed automatically.
 */
export type SubscriptionQuota = Omit<
  CompleteSubscriptionUsage['quota'],
  | 'auditLogsRetentionDays'
  // Since we are deprecation the `organizationsEnabled` key soon (use `organizationsLimit` instead), we exclude it from the usage keys for now to avoid confusion.
  | 'organizationsEnabled'
>;

export type SubscriptionUsage = Omit<
  CompleteSubscriptionUsage['usage'],
  // Since we are deprecation the `organizationsEnabled` key soon (use `organizationsLimit` instead), we exclude it from the usage keys for now to avoid confusion.
  'organizationsEnabled'
>;

export type ReportSubscriptionUpdatesUsageKey = Exclude<
  RouteRequestBodyType<PostRoutes['/api/tenants/my/subscription/item-updates']>['usageKey'],
  // Since we are deprecation the `organizationsEnabled` key soon (use `organizationsLimit` instead), we exclude it from the usage keys for now to avoid confusion.
  'organizationsEnabled'
>;

const newAddedReportableUsageKeys = Object.freeze([
  'thirdPartyApplicationsLimit',
  'userRolesLimit',
  'machineToMachineRolesLimit',
  'samlApplicationsLimit',
] satisfies Array<keyof SubscriptionQuota>);

// Have to manually define this variable since we can only get the literal union from the @logto/cloud/routes module.
export const allReportSubscriptionUpdatesUsageKeys = Object.freeze([
  'machineToMachineLimit',
  'resourcesLimit',
  'mfaEnabled',
  'organizationsLimit',
  'tenantMembersLimit',
  'enterpriseSsoLimit',
  'hooksLimit',
  'securityFeaturesEnabled',
  // TODO: Remove this dev feature guard once new pro plan is ready for production
  ...(conditional(EnvSet.values.isDevFeaturesEnabled && newAddedReportableUsageKeys) ?? []),
]) satisfies readonly ReportSubscriptionUpdatesUsageKey[];

const subscriptionStatusGuard = z.enum([
  'incomplete',
  'incomplete_expired',
  'trialing',
  'active',
  'past_due',
  'canceled',
  'unpaid',
  'paused',
]);

const upcomingInvoiceGuard = z.object({
  subtotal: z.number(),
  subtotalExcludingTax: z.number().nullable(),
  total: z.number(),
  totalExcludingTax: z.number().nullable(),
}) satisfies ToZodObject<Subscription['upcomingInvoice']>;

const logtoSkuQuotaGuard = z.object({
  mauLimit: z.number().nullable(),
  applicationsLimit: z.number().nullable(),
  thirdPartyApplicationsLimit: z.number().nullable(),
  scopesPerResourceLimit: z.number().nullable(),
  socialConnectorsLimit: z.number().nullable(),
  userRolesLimit: z.number().nullable(),
  machineToMachineRolesLimit: z.number().nullable(),
  scopesPerRoleLimit: z.number().nullable(),
  hooksLimit: z.number().nullable(),
  auditLogsRetentionDays: z.number().nullable(),
  customJwtEnabled: z.boolean(),
  subjectTokenEnabled: z.boolean(),
  bringYourUiEnabled: z.boolean(),
  collectUserProfileEnabled: z.boolean(),
  tokenLimit: z.number().nullable(),
  machineToMachineLimit: z.number().nullable(),
  resourcesLimit: z.number().nullable(),
  enterpriseSsoLimit: z.number().nullable(),
  tenantMembersLimit: z.number().nullable(),
  mfaEnabled: z.boolean(),
  organizationsEnabled: z.boolean(),
  organizationsLimit: z.number().nullable(),
  idpInitiatedSsoEnabled: z.boolean(),
  samlApplicationsLimit: z.number().nullable(),
  securityFeaturesEnabled: z.boolean(),
}) satisfies ToZodObject<SubscriptionQuota>;

/**
 * Redis cache guard for the subscription data returned from the Cloud API `/api/tenants/my/subscription`.
 * Logto core does not have access to the zod guard of the subscription data in Cloud,
 * so we need to manually define the guard here,
 * it should be kept in sync with the Cloud API response.
 */
export const subscriptionCacheGuard = z.object({
  id: z.string().optional(),
  planId: z.string(),
  currentPeriodStart: z.string(),
  currentPeriodEnd: z.string(),
  isEnterprisePlan: z.boolean(),
  status: subscriptionStatusGuard,
  upcomingInvoice: upcomingInvoiceGuard.nullable().optional(),
  quota: logtoSkuQuotaGuard,
}) satisfies ToZodObject<Subscription>;
