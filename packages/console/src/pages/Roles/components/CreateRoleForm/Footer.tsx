import { type RoleResponse, RoleType, ReservedPlanId } from '@logto/schemas';
import { useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import useSWR from 'swr';

import ContactUsPhraseLink from '@/components/ContactUsPhraseLink';
import PlanName from '@/components/PlanName';
import QuotaGuardFooter from '@/components/QuotaGuardFooter';
import { isCloud, isDevFeaturesEnabled } from '@/consts/env';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import useSubscriptionPlan from '@/hooks/use-subscription-plan';
import { hasReachedQuotaLimit } from '@/utils/quota';
import { buildUrl } from '@/utils/url';

type Props = {
  roleType: RoleType;
  selectedScopesCount: number;
  isCreating: boolean;
  onClickCreate: () => void;
};

function Footer({ roleType, selectedScopesCount, isCreating, onClickCreate }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { currentTenantId } = useContext(TenantsContext);
  const { data: currentPlan } = useSubscriptionPlan(currentTenantId);
  const { data: [, roleCount] = [] } = useSWR<[RoleResponse[], number]>(
    isCloud &&
      buildUrl('api/roles', {
        page: String(1),
        page_size: String(1),
        type: roleType,
      })
  );

  const hasRoleReachedLimit = hasReachedQuotaLimit({
    quotaKey: roleType === RoleType.User ? 'rolesLimit' : 'machineToMachineRolesLimit',
    plan: currentPlan,
    usage: roleCount ?? 0,
  });

  const hasBeyondScopesPerRoleLimit = hasReachedQuotaLimit({
    quotaKey: 'scopesPerRoleLimit',
    plan: currentPlan,
    /**
     * If usage equals to the limit, it means the current role has reached the maximum allowed scope.
     * Therefore, we should not assign any more scopes at this point.
     * However, the currently selected scopes haven't been assigned yet, so we subtract 1
     * to allow the assignment when the scope count equals to the limit.
     */
    usage: selectedScopesCount - 1,
  });

  if (currentPlan && (hasRoleReachedLimit || hasBeyondScopesPerRoleLimit)) {
    return (
      <QuotaGuardFooter>
        <Trans
          components={{
            a: <ContactUsPhraseLink />,
            planName: <PlanName name={currentPlan.name} />,
          }}
        >
          {/* User roles limit paywall */}
          {hasRoleReachedLimit &&
            roleType === RoleType.User &&
            t('upsell.paywall.roles', { count: currentPlan.quota.rolesLimit ?? 0 })}
          {hasRoleReachedLimit &&
            roleType === RoleType.MachineToMachine &&
            /* Todo @xiaoyijun [Pricing] Remove feature flag */
            (!isDevFeaturesEnabled && currentPlan.id === ReservedPlanId.Free
              ? t('upsell.paywall.deprecated_machine_to_machine_feature')
              : t('upsell.paywall.machine_to_machine_roles', {
                  count: currentPlan.quota.machineToMachineRolesLimit ?? 0,
                }))}
          {/* Role scopes limit paywall */}
          {!hasRoleReachedLimit &&
            hasBeyondScopesPerRoleLimit &&
            t('upsell.paywall.scopes_per_role', {
              count: currentPlan.quota.scopesPerRoleLimit ?? 0,
            })}
        </Trans>
      </QuotaGuardFooter>
    );
  }

  return (
    <Button
      isLoading={isCreating}
      htmlType="submit"
      title="roles.create_role_button"
      size="large"
      type="primary"
      onClick={onClickCreate}
    />
  );
}

export default Footer;
