import { z } from 'zod';

/**
 * Response contract for `GET /api/tenants/:tenantId/subscription` on the billing service.
 *
 * Mirrors the guards core keeps for the Cloud subscription cache
 * (`packages/core/src/utils/subscription/types.ts`). Keep the two in sync until core reads this
 * definition directly instead of `@logto/cloud/routes`.
 */

export const subscriptionStatusGuard = z.enum([
  'incomplete',
  'incomplete_expired',
  'trialing',
  'active',
  'past_due',
  'canceled',
  'unpaid',
  'paused',
]);

export const upcomingInvoiceGuard = z.object({
  subtotal: z.number(),
  subtotalExcludingTax: z.number().nullable(),
  total: z.number(),
  totalExcludingTax: z.number().nullable(),
});

export const logtoSkuQuotaGuard = z.object({
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
  actionsEnabled: z.boolean(),
  subjectTokenEnabled: z.boolean(),
  bringYourUiEnabled: z.boolean(),
  collectUserProfileEnabled: z.boolean(),
  passkeySignInEnabled: z.boolean(),
  tokenLimit: z.number().nullable(),
  hostedEmailLimit: z.number().nullable(),
  hostedEmailDailyLimit: z.number().nullable(),
  machineToMachineLimit: z.number().nullable(),
  resourcesLimit: z.number().nullable(),
  enterpriseSsoLimit: z.number().nullable(),
  consoleSsoConnectorLimit: z.number().nullable(),
  tenantMembersLimit: z.number().nullable(),
  mfaEnabled: z.boolean(),
  organizationsEnabled: z.boolean(),
  organizationsLimit: z.number().nullable(),
  idpInitiatedSsoEnabled: z.boolean(),
  samlApplicationsLimit: z.number().nullable(),
  securityFeaturesEnabled: z.boolean(),
  customDomainsLimit: z.number().nullable(),
});

export const systemLimitGuard = z
  .object({
    applicationsLimit: z.number(),
    thirdPartyApplicationsLimit: z.number(),
    scopesPerResourceLimit: z.number(),
    socialConnectorsLimit: z.number(),
    userRolesLimit: z.number(),
    machineToMachineRolesLimit: z.number(),
    scopesPerRoleLimit: z.number(),
    hooksLimit: z.number(),
    machineToMachineLimit: z.number(),
    resourcesLimit: z.number(),
    enterpriseSsoLimit: z.number(),
    tenantMembersLimit: z.number(),
    organizationsLimit: z.number(),
    samlApplicationsLimit: z.number(),
    usersPerOrganizationLimit: z.number(),
    organizationUserRolesLimit: z.number(),
    organizationMachineToMachineRolesLimit: z.number(),
    organizationScopesLimit: z.number(),
    customDomainsLimit: z.number(),
  })
  .partial();

export const subscriptionGuard = z.object({
  id: z.string().optional(),
  planId: z.string(),
  currentPeriodStart: z.string(),
  currentPeriodEnd: z.string(),
  isEnterprisePlan: z.boolean(),
  isDevPlan: z.boolean().optional(),
  hasBillingCustomer: z.boolean().optional(),
  status: subscriptionStatusGuard,
  upcomingInvoice: upcomingInvoiceGuard.nullable().optional(),
  quota: logtoSkuQuotaGuard,
  systemLimit: systemLimitGuard,
});

export type Subscription = z.infer<typeof subscriptionGuard>;
