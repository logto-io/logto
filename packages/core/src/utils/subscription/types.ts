import type router from '@logto/cloud/routes';
import { type RouterRoutes } from '@withtyped/client';
import { type z, type ZodType } from 'zod';

type GetRoutes = RouterRoutes<typeof router>['get'];

type RouteResponseType<T extends { search?: unknown; body?: unknown; response?: ZodType }> =
  z.infer<NonNullable<T['response']>>;

export type SubscriptionPlan = RouteResponseType<GetRoutes['/api/subscription-plans']>[number];

// Since `standardConnectorsLimit` will be removed in the upcoming pricing V2, no need to guard it.
// `tokenLimit` is not guarded in backend.
export type FeatureQuota = Omit<
  SubscriptionPlan['quota'],
  'tenantLimit' | 'mauLimit' | 'auditLogsRetentionDays' | 'standardConnectorsLimit' | 'tokenLimit'
>;
