import { type RoleResponse, RoleType } from '@logto/schemas';
import { useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import useSWR from 'swr';

import ContactUsPhraseLink from '@/components/ContactUsPhraseLink';
import PlanName from '@/components/PlanName';
import QuotaGuardFooter from '@/components/QuotaGuardFooter';
import { isCloud } from '@/consts/env';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import useSubscriptionPlan from '@/hooks/use-subscription-plan';
import { hasReachedQuotaLimit, hasSurpassedQuotaLimit } from '@/utils/quota';
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

  const hasRoleReachedLimit =
    currentPlan &&
    hasReachedQuotaLimit({
      quotaKey: roleType === RoleType.User ? 'rolesLimit' : 'machineToMachineRolesLimit',
      plan: currentPlan,
      usage: roleCount ?? 0,
    });

  const hasScopesPerRoleSurpassedLimit =
    currentPlan &&
    hasSurpassedQuotaLimit({
      quotaKey: 'scopesPerRoleLimit',
      plan: currentPlan,
      usage: selectedScopesCount,
    });

  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  if (currentPlan && (hasRoleReachedLimit || hasScopesPerRoleSurpassedLimit)) {
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
            t('upsell.paywall.machine_to_machine_roles', {
              count: currentPlan.quota.machineToMachineRolesLimit ?? 0,
            })}
          {/* Role scopes limit paywall */}
          {!hasRoleReachedLimit &&
            hasScopesPerRoleSurpassedLimit &&
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
