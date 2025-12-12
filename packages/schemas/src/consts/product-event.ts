/**
 * The product events that Logto Cloud uses for analytics and auditing.
 *
 * - All events should be in past tense, with the format of `<noun> <verb>`.
 * - Unless otherwise specified, all events should contain tenant ID as the
 *   `tenant` group distinct ID.
 *
 * @remarks
 * Events that are tracked in the cloud service will be marked with `@cloud`.
 */
export enum ProductEvent {
  /** @cloud */
  TenantCreated = 'tenant created',
  /** @cloud */
  TenantDeleted = 'tenant deleted',
  /**
   * One or more collaborators have been invited to the Logto Cloud tenant.
   *
   * @cloud
   */
  CollaboratorInvited = 'collaborator invited',
  /**
   * The Logto Cloud tenant has subscribed to the Pro plan. It may be the first time subscribing,
   * switching from the Free plan, or converting from a dev tenant, etc.
   *
   * @cloud
   */
  ProPlanSubscribed = 'pro plan subscribed',
  /**
   * The Logto Cloud tenant has canceled the Pro plan.
   *
   * @cloud
   */
  ProPlanCanceled = 'pro plan canceled',
  /**
   * The Logto Cloud tenant has subscribed to the Free plan. This may happen when a tenant
   * newly created or downgrading from the Pro plan.
   *
   * @cloud
   */
  FreePlanSubscribed = 'free plan subscribed',
  /**
   * A user has been created in the admin tenant. Interactive and non-interactive creations are
   * both included.
   */
  DeveloperCreated = 'developer created',
  /** A user has been deleted in the admin tenant. */
  DeveloperDeleted = 'developer deleted',
  AppCreated = 'app created',
  AppDeleted = 'app deleted',
  RoleCreated = 'role created',
  RoleDeleted = 'role deleted',
  ApiResourceCreated = 'api resource created',
  ApiResourceDeleted = 'api resource deleted',
  OrganizationCreated = 'organization created',
  OrganizationDeleted = 'organization deleted',
  OrganizationRoleCreated = 'organization role created',
  OrganizationRoleDeleted = 'organization role deleted',
  SsoConnectorCreated = 'sso connector created',
  SsoConnectorDeleted = 'sso connector deleted',
  PasswordlessConnectorUpdated = 'passwordless connector updated',
  SocialConnectorCreated = 'connector created',
  SocialConnectorDeleted = 'connector deleted',
  WebhookCreated = 'webhook created',
  WebhookDeleted = 'webhook deleted',
  CustomJwtDeployed = 'custom jwt deployed',
  MfaEnabled = 'mfa enabled',
  MfaDisabled = 'mfa disabled',
  CustomDomainCreated = 'custom domain created',
  CustomDomainDeleted = 'custom domain deleted',
}

/** The PostHog groups for product events. */
export enum EventGroup {
  Tenant = 'tenant',
}

/**
 * The static distinct ID for tenant-level events. This is used when the event is not
 * associated with a specific user.
 *
 * @see {@link https://posthog.com/docs/product-analytics/group-analytics#advanced-server-side-only-capturing-group-events-without-a-user}
 */
export const tenantEventDistinctId = 'TENANT_EVENT';

/**
 * The header that carries the cloud user ID in a request from Logto Cloud. This is useful for
 * identifying the user who initiated the Management API request proxied by the cloud service.
 */
export const cloudUserIdHeader = 'logto-cloud-user-id';
