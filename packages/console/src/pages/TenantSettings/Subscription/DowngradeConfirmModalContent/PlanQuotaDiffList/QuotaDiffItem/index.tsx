import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import { type TFuncKey } from 'i18next';

import DescendArrow from '@/assets/icons/descend-arrow.svg';
import Failed from '@/assets/icons/failed.svg';
import DynamicT from '@/ds-components/DynamicT';
import { type SubscriptionPlanQuota } from '@/types/subscriptions';

import * as styles from './index.module.scss';

const quotaItemPhrasesMap: Record<
  keyof SubscriptionPlanQuota,
  TFuncKey<'translation', 'admin_console.subscription.quota_item'>
> = {
  mauLimit: 'mau_limit.name',
  applicationsLimit: 'applications_limit.name',
  machineToMachineLimit: 'machine_to_machine_limit.name',
  resourcesLimit: 'resources_limit.name',
  scopesPerResourceLimit: 'scopes_per_resource_limit.name',
  customDomainEnabled: 'custom_domain_enabled.name',
  omniSignInEnabled: 'omni_sign_in_enabled.name',
  builtInEmailConnectorEnabled: 'built_in_email_connector_enabled.name',
  socialConnectorsLimit: 'social_connectors_limit.name',
  standardConnectorsLimit: 'standard_connectors_limit.name',
  rolesLimit: 'roles_limit.name',
  scopesPerRoleLimit: 'scopes_per_role_limit.name',
  hooksLimit: 'hooks_limit.name',
  auditLogsRetentionDays: 'audit_logs_retention_days.name',
  communitySupportEnabled: 'community_support_enabled.name',
  ticketSupportResponseTime: 'customer_ticket_support.name',
};

const quotaItemUnlimitedPhrasesMap: Record<
  keyof SubscriptionPlanQuota,
  TFuncKey<'translation', 'admin_console.subscription.quota_item'>
> = {
  mauLimit: 'mau_limit.unlimited',
  applicationsLimit: 'applications_limit.unlimited',
  machineToMachineLimit: 'machine_to_machine_limit.unlimited',
  resourcesLimit: 'resources_limit.unlimited',
  scopesPerResourceLimit: 'scopes_per_resource_limit.unlimited',
  customDomainEnabled: 'custom_domain_enabled.unlimited',
  omniSignInEnabled: 'omni_sign_in_enabled.unlimited',
  builtInEmailConnectorEnabled: 'built_in_email_connector_enabled.unlimited',
  socialConnectorsLimit: 'social_connectors_limit.unlimited',
  standardConnectorsLimit: 'standard_connectors_limit.unlimited',
  rolesLimit: 'roles_limit.unlimited',
  scopesPerRoleLimit: 'scopes_per_role_limit.unlimited',
  hooksLimit: 'hooks_limit.unlimited',
  auditLogsRetentionDays: 'audit_logs_retention_days.unlimited',
  communitySupportEnabled: 'community_support_enabled.unlimited',
  ticketSupportResponseTime: 'customer_ticket_support.unlimited',
};

const quotaItemLimitedPhrasesMap: Record<
  keyof SubscriptionPlanQuota,
  TFuncKey<'translation', 'admin_console.subscription.quota_item'>
> = {
  mauLimit: 'mau_limit.limited',
  applicationsLimit: 'applications_limit.limited',
  machineToMachineLimit: 'machine_to_machine_limit.limited',
  resourcesLimit: 'resources_limit.limited',
  scopesPerResourceLimit: 'scopes_per_resource_limit.limited',
  customDomainEnabled: 'custom_domain_enabled.limited',
  omniSignInEnabled: 'omni_sign_in_enabled.limited',
  builtInEmailConnectorEnabled: 'built_in_email_connector_enabled.limited',
  socialConnectorsLimit: 'social_connectors_limit.limited',
  standardConnectorsLimit: 'standard_connectors_limit.limited',
  rolesLimit: 'roles_limit.limited',
  scopesPerRoleLimit: 'scopes_per_role_limit.limited',
  hooksLimit: 'hooks_limit.limited',
  auditLogsRetentionDays: 'audit_logs_retention_days.limited',
  communitySupportEnabled: 'community_support_enabled.limited',
  ticketSupportResponseTime: 'customer_ticket_support.limited',
};

type Props = {
  isChangeStateVisible?: boolean;
  quotaKey: keyof SubscriptionPlanQuota;
  quotaValue: SubscriptionPlanQuota[keyof SubscriptionPlanQuota];
};

function QuotaDiffItem({ isChangeStateVisible = false, quotaKey, quotaValue }: Props) {
  const isUnlimited = quotaValue === null;
  const isNotCapable = !isUnlimited && !quotaValue;
  const isLimited = !isUnlimited && !isNotCapable;

  const Icon = isNotCapable ? Failed : DescendArrow;

  return (
    <li className={classNames(styles.item, isChangeStateVisible && styles.withChangeState)}>
      <span
        className={classNames(
          styles.itemContent,
          isChangeStateVisible && isNotCapable && styles.notCapable
        )}
      >
        {isChangeStateVisible && <Icon className={styles.icon} />}
        <span>
          {isUnlimited && (
            <DynamicT
              forKey={`subscription.quota_item.${quotaItemUnlimitedPhrasesMap[quotaKey]}`}
            />
          )}
          {isNotCapable && (
            <DynamicT forKey={`subscription.quota_item.${quotaItemPhrasesMap[quotaKey]}`} />
          )}
          {isLimited && (
            <DynamicT
              forKey={`subscription.quota_item.${quotaItemLimitedPhrasesMap[quotaKey]}`}
              interpolation={conditional(typeof quotaValue === 'number' && { count: quotaValue })}
            />
          )}
        </span>
      </span>
    </li>
  );
}

export default QuotaDiffItem;
