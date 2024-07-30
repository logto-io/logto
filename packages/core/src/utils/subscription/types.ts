import type router from '@logto/cloud/routes';
import { type RouterRoutes } from '@withtyped/client';
import { type z, type ZodType } from 'zod';

type GetRoutes = RouterRoutes<typeof router>['get'];

type RouteResponseType<T extends { search?: unknown; body?: unknown; response?: ZodType }> =
  z.infer<NonNullable<T['response']>>;

export type SubscriptionPlan = RouteResponseType<GetRoutes['/api/subscription-plans']>[number];

export type Subscription = RouteResponseType<GetRoutes['/api/tenants/:tenantId/subscription']>;

// Since `standardConnectorsLimit` will be removed in the upcoming pricing V2, no need to guard it.
// `tokenLimit` is not guarded in backend.
export type FeatureQuota = Omit<
  SubscriptionPlan['quota'],
  'tenantLimit' | 'mauLimit' | 'auditLogsRetentionDays' | 'standardConnectorsLimit' | 'tokenLimit'
>;

/**
 * The type of the response of the `GET /api/tenants/:tenantId/subscription/quota` endpoint.
 * It is the same as the response type of `GET /api/tenants/my/subscription/quota` endpoint.
 *
 * @remarks
 * The `auditLogsRetentionDays` will be handled by cron job in Azure Functions, outdated audit logs will be removed automatically.
 */
export type SubscriptionQuota = Omit<
  RouteResponseType<GetRoutes['/api/tenants/:tenantId/subscription/quota']>,
  'auditLogsRetentionDays'
>;

/**
 * The type of the response of the `GET /api/tenants/:tenantId/subscription/usage` endpoint.
 * It is the same as the response type of `GET /api/tenants/my/subscription/usage` endpoint.
 */
export type SubscriptionUsage = RouteResponseType<
  GetRoutes['/api/tenants/:tenantId/subscription/usage']
>;
