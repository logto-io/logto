import type router from '@logto/cloud/routes';
import { type tenantAuthRouter } from '@logto/cloud/routes';
import { type GuardedResponse, type RouterRoutes } from '@withtyped/client';

type GetRoutes = RouterRoutes<typeof router>['get'];
type GetTenantAuthRoutes = RouterRoutes<typeof tenantAuthRouter>['get'];

export type GetArrayElementType<T> = T extends Array<infer U> ? U : never;

export type SubscriptionPlanResponse = GuardedResponse<
  GetRoutes['/api/subscription-plans']
>[number];

export type Subscription = GuardedResponse<GetRoutes['/api/tenants/:tenantId/subscription']>;

export type SubscriptionUsage = GuardedResponse<GetRoutes['/api/tenants/:tenantId/usage']>;

export type InvoicesResponse = GuardedResponse<GetRoutes['/api/tenants/:tenantId/invoices']>;

// The response of GET /api/tenants is TenantResponse[].
export type TenantResponse = GetArrayElementType<GuardedResponse<GetRoutes['/api/tenants']>>;

export type TenantMemberResponse = GetArrayElementType<
  GuardedResponse<GetTenantAuthRoutes['/api/tenants/:tenantId/members']>
>;
