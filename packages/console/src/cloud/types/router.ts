import type router from '@logto/cloud/routes';
import { type tenantAuthRouter } from '@logto/cloud/routes';
import { type GuardedResponse, type RouterRoutes } from '@withtyped/client';

type GetRoutes = RouterRoutes<typeof router>['get'];
type GetTenantAuthRoutes = RouterRoutes<typeof tenantAuthRouter>['get'];

export type GetArrayElementType<T> = T extends Array<infer U> ? U : never;

export type SubscriptionPlanResponse = GuardedResponse<
  GetRoutes['/api/subscription-plans']
>[number];

export type LogtoSkuResponse = GetArrayElementType<GuardedResponse<GetRoutes['/api/skus']>>;

export type Subscription = GuardedResponse<GetRoutes['/api/tenants/:tenantId/subscription']>;

/* ===== Use `New` in the naming to avoid confusion with legacy types ===== */
export type NewSubscriptionUsageResponse = GuardedResponse<
  GetRoutes['/api/tenants/:tenantId/subscription-usage']
>;
/** The response of `GET /api/tenants/my/subscription/quota` has the same response type. */
export type NewSubscriptionQuota = Omit<
  NewSubscriptionUsageResponse['quota'],
  // Since we are deprecation the `organizationsEnabled` key soon (use `organizationsLimit` instead), we exclude it from the quota keys for now to avoid confusion.
  'organizationsEnabled'
>;
/** The response of `GET /api/tenants/my/subscription/usage` has the same response type. */
export type NewSubscriptionCountBasedUsage = Omit<
  NewSubscriptionUsageResponse['usage'],
  // Since we are deprecation the `organizationsEnabled` key soon (use `organizationsLimit` instead), we exclude it from the usage keys for now to avoid confusion.
  'organizationsEnabled'
>;
export type NewSubscriptionResourceScopeUsage = NewSubscriptionUsageResponse['resources'];
export type NewSubscriptionRoleScopeUsage = Omit<
  NewSubscriptionUsageResponse['roles'],
  // Since we are deprecation the `organizationsEnabled` key soon (use `organizationsLimit` instead), we exclude it from the quota keys for now to avoid confusion.
  'organizationsEnabled'
>;

export type NewSubscriptionPeriodicUsage = GuardedResponse<
  GetRoutes['/api/tenants/:tenantId/subscription/periodic-usage']
>;

/* ===== Use `New` in the naming to avoid confusion with legacy types ===== */

export type InvoicesResponse = GuardedResponse<GetRoutes['/api/tenants/:tenantId/invoices']>;

export type InvitationResponse = GuardedResponse<GetRoutes['/api/invitations/:invitationId']>;

export type InvitationListResponse = GuardedResponse<GetRoutes['/api/invitations']>;

// The response of GET /api/tenants is TenantResponse[].
export type TenantResponse = GetArrayElementType<GuardedResponse<GetRoutes['/api/tenants']>>;

// Start of the auth routes types. Accessing the auth routes requires an organization token.
export type TenantMemberResponse = GetArrayElementType<
  GuardedResponse<GetTenantAuthRoutes['/api/tenants/:tenantId/members']>
>;

export type TenantInvitationResponse = GetArrayElementType<
  GuardedResponse<GetTenantAuthRoutes['/api/tenants/:tenantId/invitations']>
>;
// End of the auth routes types
