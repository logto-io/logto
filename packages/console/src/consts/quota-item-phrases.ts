import { type TFuncKey } from 'i18next';

import { type LogtoSkuQuota } from '@/types/skus';
import { type SubscriptionPlanQuota } from '@/types/subscriptions';

/** @deprecated */
export const quotaItemPhrasesMap: Record<
  keyof SubscriptionPlanQuota,
  TFuncKey<'translation', 'admin_console.subscription.quota_item'>
> = {
  mauLimit: 'mau_limit.name',
  tokenLimit: 'token_limit.name',
  applicationsLimit: 'applications_limit.name',
  machineToMachineLimit: 'machine_to_machine_limit.name',
  thirdPartyApplicationsLimit: 'third_party_applications_limit.name',
  resourcesLimit: 'resources_limit.name',
  scopesPerResourceLimit: 'scopes_per_resource_limit.name',
  customDomainEnabled: 'custom_domain_enabled.name',
  omniSignInEnabled: 'omni_sign_in_enabled.name',
  socialConnectorsLimit: 'social_connectors_limit.name',
  standardConnectorsLimit: 'standard_connectors_limit.name',
  rolesLimit: 'roles_limit.name',
  machineToMachineRolesLimit: 'machine_to_machine_roles_limit.name',
  scopesPerRoleLimit: 'scopes_per_role_limit.name',
  hooksLimit: 'hooks_limit.name',
  auditLogsRetentionDays: 'audit_logs_retention_days.name',
  ticketSupportResponseTime: 'email_ticket_support.name',
  mfaEnabled: 'mfa_enabled.name',
  organizationsEnabled: 'organizations_enabled.name',
  ssoEnabled: 'sso_enabled.name',
  tenantMembersLimit: 'tenant_members_limit.name',
  customJwtEnabled: 'custom_jwt_enabled.name',
  subjectTokenEnabled: 'impersonation_enabled.name',
  bringYourUiEnabled: 'bring_your_ui_enabled.name',
};

/** @deprecated */
export const quotaItemUnlimitedPhrasesMap: Record<
  keyof SubscriptionPlanQuota,
  TFuncKey<'translation', 'admin_console.subscription.quota_item'>
> = {
  mauLimit: 'mau_limit.unlimited',
  tokenLimit: 'token_limit.unlimited',
  applicationsLimit: 'applications_limit.unlimited',
  machineToMachineLimit: 'machine_to_machine_limit.unlimited',
  thirdPartyApplicationsLimit: 'third_party_applications_limit.unlimited',
  resourcesLimit: 'resources_limit.unlimited',
  scopesPerResourceLimit: 'scopes_per_resource_limit.unlimited',
  customDomainEnabled: 'custom_domain_enabled.unlimited',
  omniSignInEnabled: 'omni_sign_in_enabled.unlimited',
  socialConnectorsLimit: 'social_connectors_limit.unlimited',
  standardConnectorsLimit: 'standard_connectors_limit.unlimited',
  rolesLimit: 'roles_limit.unlimited',
  machineToMachineRolesLimit: 'machine_to_machine_roles_limit.unlimited',
  scopesPerRoleLimit: 'scopes_per_role_limit.unlimited',
  hooksLimit: 'hooks_limit.unlimited',
  auditLogsRetentionDays: 'audit_logs_retention_days.unlimited',
  ticketSupportResponseTime: 'email_ticket_support.unlimited',
  mfaEnabled: 'mfa_enabled.unlimited',
  organizationsEnabled: 'organizations_enabled.unlimited',
  ssoEnabled: 'sso_enabled.unlimited',
  tenantMembersLimit: 'tenant_members_limit.unlimited',
  customJwtEnabled: 'custom_jwt_enabled.unlimited',
  subjectTokenEnabled: 'impersonation_enabled.unlimited',
  bringYourUiEnabled: 'bring_your_ui_enabled.unlimited',
};

/** @deprecated */
export const quotaItemLimitedPhrasesMap: Record<
  keyof SubscriptionPlanQuota,
  TFuncKey<'translation', 'admin_console.subscription.quota_item'>
> = {
  mauLimit: 'mau_limit.limited',
  tokenLimit: 'token_limit.limited',
  applicationsLimit: 'applications_limit.limited',
  machineToMachineLimit: 'machine_to_machine_limit.limited',
  thirdPartyApplicationsLimit: 'third_party_applications_limit.limited',
  resourcesLimit: 'resources_limit.limited',
  scopesPerResourceLimit: 'scopes_per_resource_limit.limited',
  customDomainEnabled: 'custom_domain_enabled.limited',
  omniSignInEnabled: 'omni_sign_in_enabled.limited',
  socialConnectorsLimit: 'social_connectors_limit.limited',
  standardConnectorsLimit: 'standard_connectors_limit.limited',
  rolesLimit: 'roles_limit.limited',
  machineToMachineRolesLimit: 'machine_to_machine_roles_limit.limited',
  scopesPerRoleLimit: 'scopes_per_role_limit.limited',
  hooksLimit: 'hooks_limit.limited',
  auditLogsRetentionDays: 'audit_logs_retention_days.limited',
  ticketSupportResponseTime: 'email_ticket_support.limited',
  mfaEnabled: 'mfa_enabled.limited',
  organizationsEnabled: 'organizations_enabled.limited',
  ssoEnabled: 'sso_enabled.limited',
  tenantMembersLimit: 'tenant_members_limit.limited',
  customJwtEnabled: 'custom_jwt_enabled.limited',
  subjectTokenEnabled: 'impersonation_enabled.limited',
  bringYourUiEnabled: 'bring_your_ui_enabled.limited',
};

/** @deprecated */
export const quotaItemNotEligiblePhrasesMap: Record<
  keyof SubscriptionPlanQuota,
  TFuncKey<'translation', 'admin_console.subscription.quota_item'>
> = {
  mauLimit: 'mau_limit.not_eligible',
  tokenLimit: 'token_limit.not_eligible',
  applicationsLimit: 'applications_limit.not_eligible',
  machineToMachineLimit: 'machine_to_machine_limit.not_eligible',
  thirdPartyApplicationsLimit: 'third_party_applications_limit.not_eligible',
  resourcesLimit: 'resources_limit.not_eligible',
  scopesPerResourceLimit: 'scopes_per_resource_limit.not_eligible',
  customDomainEnabled: 'custom_domain_enabled.not_eligible',
  omniSignInEnabled: 'omni_sign_in_enabled.not_eligible',
  socialConnectorsLimit: 'social_connectors_limit.not_eligible',
  standardConnectorsLimit: 'standard_connectors_limit.not_eligible',
  rolesLimit: 'roles_limit.not_eligible',
  machineToMachineRolesLimit: 'machine_to_machine_roles_limit.not_eligible',
  scopesPerRoleLimit: 'scopes_per_role_limit.not_eligible',
  hooksLimit: 'hooks_limit.not_eligible',
  auditLogsRetentionDays: 'audit_logs_retention_days.not_eligible',
  ticketSupportResponseTime: 'email_ticket_support.not_eligible',
  mfaEnabled: 'mfa_enabled.not_eligible',
  organizationsEnabled: 'organizations_enabled.not_eligible',
  ssoEnabled: 'sso_enabled.not_eligible',
  tenantMembersLimit: 'tenant_members_limit.not_eligible',
  customJwtEnabled: 'custom_jwt_enabled.not_eligible',
  subjectTokenEnabled: 'impersonation_enabled.not_eligible',
  bringYourUiEnabled: 'bring_your_ui_enabled.not_eligible',
};

/* === for new pricing model === */
export const skuQuotaItemPhrasesMap: Record<
  keyof LogtoSkuQuota,
  TFuncKey<'translation', 'admin_console.subscription.quota_item'>
> = {
  mauLimit: 'mau_limit.name',
  tokenLimit: 'token_limit.name',
  applicationsLimit: 'applications_limit.name',
  machineToMachineLimit: 'machine_to_machine_limit.name',
  thirdPartyApplicationsLimit: 'third_party_applications_limit.name',
  resourcesLimit: 'resources_limit.name',
  scopesPerResourceLimit: 'scopes_per_resource_limit.name',
  socialConnectorsLimit: 'social_connectors_limit.name',
  userRolesLimit: 'roles_limit.name',
  machineToMachineRolesLimit: 'machine_to_machine_roles_limit.name',
  scopesPerRoleLimit: 'scopes_per_role_limit.name',
  hooksLimit: 'hooks_limit.name',
  auditLogsRetentionDays: 'audit_logs_retention_days.name',
  ticketSupportResponseTime: 'email_ticket_support.name',
  mfaEnabled: 'mfa_enabled.name',
  organizationsEnabled: 'organizations_enabled.name',
  enterpriseSsoLimit: 'sso_enabled.name',
  tenantMembersLimit: 'tenant_members_limit.name',
  customJwtEnabled: 'custom_jwt_enabled.name',
  subjectTokenEnabled: 'impersonation_enabled.name',
  bringYourUiEnabled: 'bring_your_ui_enabled.name',
};

export const skuQuotaItemUnlimitedPhrasesMap: Record<
  keyof LogtoSkuQuota,
  TFuncKey<'translation', 'admin_console.subscription.quota_item'>
> = {
  mauLimit: 'mau_limit.unlimited',
  tokenLimit: 'token_limit.unlimited',
  applicationsLimit: 'applications_limit.unlimited',
  machineToMachineLimit: 'machine_to_machine_limit.unlimited',
  thirdPartyApplicationsLimit: 'third_party_applications_limit.unlimited',
  resourcesLimit: 'resources_limit.unlimited',
  scopesPerResourceLimit: 'scopes_per_resource_limit.unlimited',
  socialConnectorsLimit: 'social_connectors_limit.unlimited',
  userRolesLimit: 'roles_limit.unlimited',
  machineToMachineRolesLimit: 'machine_to_machine_roles_limit.unlimited',
  scopesPerRoleLimit: 'scopes_per_role_limit.unlimited',
  hooksLimit: 'hooks_limit.unlimited',
  auditLogsRetentionDays: 'audit_logs_retention_days.unlimited',
  ticketSupportResponseTime: 'email_ticket_support.unlimited',
  mfaEnabled: 'mfa_enabled.unlimited',
  organizationsEnabled: 'organizations_enabled.unlimited',
  enterpriseSsoLimit: 'sso_enabled.unlimited',
  tenantMembersLimit: 'tenant_members_limit.unlimited',
  customJwtEnabled: 'custom_jwt_enabled.unlimited',
  subjectTokenEnabled: 'impersonation_enabled.unlimited',
  bringYourUiEnabled: 'bring_your_ui_enabled.unlimited',
};

export const skuQuotaItemLimitedPhrasesMap: Record<
  keyof LogtoSkuQuota,
  TFuncKey<'translation', 'admin_console.subscription.quota_item'>
> = {
  mauLimit: 'mau_limit.limited',
  tokenLimit: 'token_limit.limited',
  applicationsLimit: 'applications_limit.limited',
  machineToMachineLimit: 'machine_to_machine_limit.limited',
  thirdPartyApplicationsLimit: 'third_party_applications_limit.limited',
  resourcesLimit: 'resources_limit.limited',
  scopesPerResourceLimit: 'scopes_per_resource_limit.limited',
  socialConnectorsLimit: 'social_connectors_limit.limited',
  userRolesLimit: 'roles_limit.limited',
  machineToMachineRolesLimit: 'machine_to_machine_roles_limit.limited',
  scopesPerRoleLimit: 'scopes_per_role_limit.limited',
  hooksLimit: 'hooks_limit.limited',
  auditLogsRetentionDays: 'audit_logs_retention_days.limited',
  ticketSupportResponseTime: 'email_ticket_support.limited',
  mfaEnabled: 'mfa_enabled.limited',
  organizationsEnabled: 'organizations_enabled.limited',
  enterpriseSsoLimit: 'sso_enabled.limited',
  tenantMembersLimit: 'tenant_members_limit.limited',
  customJwtEnabled: 'custom_jwt_enabled.limited',
  subjectTokenEnabled: 'impersonation_enabled.limited',
  bringYourUiEnabled: 'bring_your_ui_enabled.limited',
};

export const skuQuotaItemNotEligiblePhrasesMap: Record<
  keyof LogtoSkuQuota,
  TFuncKey<'translation', 'admin_console.subscription.quota_item'>
> = {
  mauLimit: 'mau_limit.not_eligible',
  tokenLimit: 'token_limit.not_eligible',
  applicationsLimit: 'applications_limit.not_eligible',
  machineToMachineLimit: 'machine_to_machine_limit.not_eligible',
  thirdPartyApplicationsLimit: 'third_party_applications_limit.not_eligible',
  resourcesLimit: 'resources_limit.not_eligible',
  scopesPerResourceLimit: 'scopes_per_resource_limit.not_eligible',
  socialConnectorsLimit: 'social_connectors_limit.not_eligible',
  userRolesLimit: 'roles_limit.not_eligible',
  machineToMachineRolesLimit: 'machine_to_machine_roles_limit.not_eligible',
  scopesPerRoleLimit: 'scopes_per_role_limit.not_eligible',
  hooksLimit: 'hooks_limit.not_eligible',
  auditLogsRetentionDays: 'audit_logs_retention_days.not_eligible',
  ticketSupportResponseTime: 'email_ticket_support.not_eligible',
  mfaEnabled: 'mfa_enabled.not_eligible',
  organizationsEnabled: 'organizations_enabled.not_eligible',
  enterpriseSsoLimit: 'sso_enabled.not_eligible',
  tenantMembersLimit: 'tenant_members_limit.not_eligible',
  customJwtEnabled: 'custom_jwt_enabled.not_eligible',
  subjectTokenEnabled: 'impersonation_enabled.not_eligible',
  bringYourUiEnabled: 'bring_your_ui_enabled.not_eligible',
};
/* === for new pricing model === */
