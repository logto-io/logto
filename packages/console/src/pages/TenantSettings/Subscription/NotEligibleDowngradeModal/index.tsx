import { conditional } from '@silverhand/essentials';
import { type TFuncKey } from 'i18next';
import { Trans, useTranslation } from 'react-i18next';

import PlanName from '@/components/PlanName';
import ConfirmModal from '@/ds-components/ConfirmModal';
import DynamicT from '@/ds-components/DynamicT';
import { type SubscriptionPlan, type SubscriptionPlanQuota } from '@/types/subscriptions';

import * as styles from './index.module.scss';

const quotaItemLimitedPhrasesMap: Record<
  keyof SubscriptionPlanQuota,
  TFuncKey<'translation', 'admin_console.subscription.quota_item'>
> = {
  tenantLimit: 'tenant_limit.limited',
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

const quotaItemNotEligiblePhrasesMap: Record<
  keyof SubscriptionPlanQuota,
  TFuncKey<'translation', 'admin_console.subscription.quota_item'>
> = {
  tenantLimit: 'tenant_limit.not_eligible',
  mauLimit: 'mau_limit.not_eligible',
  applicationsLimit: 'applications_limit.not_eligible',
  machineToMachineLimit: 'machine_to_machine_limit.not_eligible',
  resourcesLimit: 'resources_limit.not_eligible',
  scopesPerResourceLimit: 'scopes_per_resource_limit.not_eligible',
  customDomainEnabled: 'custom_domain_enabled.not_eligible',
  omniSignInEnabled: 'omni_sign_in_enabled.not_eligible',
  builtInEmailConnectorEnabled: 'built_in_email_connector_enabled.not_eligible',
  socialConnectorsLimit: 'social_connectors_limit.not_eligible',
  standardConnectorsLimit: 'standard_connectors_limit.not_eligible',
  rolesLimit: 'roles_limit.not_eligible',
  scopesPerRoleLimit: 'scopes_per_role_limit.not_eligible',
  hooksLimit: 'hooks_limit.not_eligible',
  auditLogsRetentionDays: 'audit_logs_retention_days.not_eligible',
  communitySupportEnabled: 'community_support_enabled.not_eligible',
  ticketSupportResponseTime: 'customer_ticket_support.not_eligible',
};

const excludedQuotaKeys = new Set<keyof SubscriptionPlanQuota>([
  'auditLogsRetentionDays',
  'communitySupportEnabled',
  'ticketSupportResponseTime',
]);

type Props = {
  targetSubscriptionPlan: SubscriptionPlan;
};

/**
 * Todo: @xiaoyijun use confirm modal hook on code rebased
 */
function NotEligibleDowngradeModal({ targetSubscriptionPlan }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const { name, quota } = targetSubscriptionPlan;

  // eslint-disable-next-line no-restricted-syntax
  const entries = Object.entries(quota) as Array<
    [keyof SubscriptionPlanQuota, SubscriptionPlanQuota[keyof SubscriptionPlanQuota]]
  >;

  return (
    <ConfirmModal
      isOpen
      title="subscription.downgrade_modal.title"
      confirmButtonText="general.got_it"
      confirmButtonType="primary"
      onCancel={() => {
        // Todo @xiaoyijun close modal
      }}
      onConfirm={() => {
        // Todo @xiaoyijun implement downgrade
      }}
    >
      <div className={styles.description}>
        <Trans
          components={{
            name: <PlanName name={name} />,
          }}
        >
          {t('subscription.downgrade_modal.not_eligible_description')}
        </Trans>
      </div>
      <ul className={styles.list}>
        {entries.map(([quotaKey, quotaValue]) => {
          if (
            excludedQuotaKeys.has(quotaKey) ||
            quotaValue === null || // Unlimited items
            quotaValue === true // Eligible items
          ) {
            return null;
          }

          return (
            <li key={quotaKey}>
              {quotaValue ? (
                <Trans
                  components={{
                    item: (
                      <DynamicT
                        forKey={`subscription.quota_item.${quotaItemLimitedPhrasesMap[quotaKey]}`}
                        interpolation={conditional(
                          typeof quotaValue === 'number' && { count: quotaValue }
                        )}
                      />
                    ),
                  }}
                >
                  {t('subscription.downgrade_modal.a_maximum_of')}
                </Trans>
              ) : (
                <DynamicT
                  forKey={`subscription.quota_item.${quotaItemNotEligiblePhrasesMap[quotaKey]}`}
                />
              )}
            </li>
          );
        })}
      </ul>
    </ConfirmModal>
  );
}

export default NotEligibleDowngradeModal;
