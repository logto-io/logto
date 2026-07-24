import type router from '@logto/cloud/routes';
import { type tenantAuthRouter } from '@logto/cloud/routes';
import { type GuardedResponse, type RouterRoutes } from '@withtyped/client';

type GetRoutes = RouterRoutes<typeof router>['get'];
type GetTenantAuthRoutes = RouterRoutes<typeof tenantAuthRouter>['get'];

export type GetArrayElementType<T> = T extends Array<infer U> ? U : never;

type CloudLogtoSkuResponse = GetArrayElementType<GuardedResponse<GetRoutes['/api/skus']>>;

export type Subscription = GuardedResponse<GetRoutes['/api/tenants/:tenantId/subscription']>;

export type TenantUsageAddOnSkus = GuardedResponse<
  GetRoutes['/api/tenants/:tenantId/subscription/add-on-skus']
>;

export type SystemLimit = GuardedResponse<GetRoutes['/api/tenants/my/subscription']>['systemLimit'];

export type SubscriptionUsageResponse = GuardedResponse<
  GetRoutes['/api/tenants/:tenantId/subscription-usage']
>;

export type SubscriptionQuota = Omit<
  SubscriptionUsageResponse['quota'],
  // Logto uses `actionsEnabled` as the canonical Actions quota key. Keep the legacy Cloud
  // compatibility field out of the Console subscription types.
  | 'inlineHooksEnabled'
  // Since we are deprecating the `organizationsEnabled` key soon (use `organizationsLimit` instead), we exclude it from the quota keys for now to avoid confusion.
  | 'organizationsEnabled'
>;

export type LogtoSkuResponse = Omit<CloudLogtoSkuResponse, 'quota'> & {
  quota: Omit<CloudLogtoSkuResponse['quota'], 'inlineHooksEnabled'> & {
    // Cloud keeps returning the legacy key for backward compatibility. It is removed when
    // normalizing the response at the Console boundary.
    inlineHooksEnabled?: boolean;
  };
};

export type SubscriptionCountBasedUsage = Omit<
  SubscriptionUsageResponse['usage'],
  // Logto uses `actionsEnabled` as the canonical Actions quota key. Keep the legacy Cloud
  // compatibility field out of the Console subscription usage types.
  | 'inlineHooksEnabled'
  // Since we are deprecating the `organizationsEnabled` key soon (use `organizationsLimit` instead), we exclude it from the usage keys for now to avoid confusion.
  | 'organizationsEnabled'
>;
export type SubscriptionResourceScopeUsage = SubscriptionUsageResponse['resources'];
export type SubscriptionRoleScopeUsage = Omit<
  SubscriptionUsageResponse['roles'],
  // Since we are deprecating the `organizationsEnabled` key soon (use `organizationsLimit` instead), we exclude it from the quota keys for now to avoid confusion.
  'organizationsEnabled'
>;

export type SubscriptionPeriodicUsage = GuardedResponse<
  GetRoutes['/api/tenants/:tenantId/subscription/periodic-usage']
>;

export type InvoicesResponse = GuardedResponse<GetRoutes['/api/tenants/:tenantId/invoices']>;

export type InvitationResponse = GuardedResponse<GetRoutes['/api/invitations/:invitationId']>;

export type InvitationListResponse = GuardedResponse<GetRoutes['/api/invitations']>;

/** Type for the response of the `/api/tenants` endpoint. */
export type TenantResponse = GetArrayElementType<GuardedResponse<GetRoutes['/api/tenants']>>;

// Start of the auth routes types. Accessing the auth routes requires an organization token.
export type TenantMemberResponse = GetArrayElementType<
  GuardedResponse<GetTenantAuthRoutes['/api/tenants/:tenantId/members']>
>;

export type TenantInvitationResponse = GetArrayElementType<
  GuardedResponse<GetTenantAuthRoutes['/api/tenants/:tenantId/invitations']>
>;

export type TenantSettingsResponse = GuardedResponse<
  GetTenantAuthRoutes['/api/tenants/:tenantId/settings']
>;
// End of the auth routes types

export type RegionResponse = GetArrayElementType<
  GuardedResponse<GetRoutes['/api/me/regions']>['regions']
>;

export type LogtoEnterpriseResponse = GetArrayElementType<
  GuardedResponse<GetRoutes['/api/me/logto-enterprises']>['logtoEnterprises']
>;

export type LogtoEnterpriseSubscriptionResponse = GuardedResponse<
  GetRoutes['/api/me/logto-enterprises/:id']
>;

export type LogtoEnterpriseSubscriptionInvoiceResponse = GetArrayElementType<
  GuardedResponse<GetRoutes['/api/me/logto-enterprises/:id/invoices']>['invoices']
>;
