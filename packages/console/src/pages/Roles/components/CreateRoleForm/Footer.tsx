import { RoleType, type ScopeResponse } from '@logto/schemas';
import { useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import ContactUsPhraseLink from '@/components/ContactUsPhraseLink';
import QuotaGuardFooter from '@/components/QuotaGuardFooter';
import SkuName from '@/components/SkuName';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import Button from '@/ds-components/Button';

type Props = {
  readonly roleType: RoleType;
  readonly scopes?: ScopeResponse[];
  readonly isCreating: boolean;
  readonly onClickCreate: () => void;
};

function Footer({ roleType, scopes, isCreating, onClickCreate }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    currentSubscription: { planId, isEnterprisePlan },
    currentSubscriptionQuota,
    hasReachedSubscriptionQuotaLimit,
    hasSurpassedSubscriptionQuotaLimit,
  } = useContext(SubscriptionDataContext);

  const hasRoleReachedLimit = hasReachedSubscriptionQuotaLimit(
    roleType === RoleType.User ? 'userRolesLimit' : 'machineToMachineRolesLimit'
  );

  const hasScopesPerRoleSurpassedLimit = hasSurpassedSubscriptionQuotaLimit(
    'scopesPerRoleLimit',
    scopes?.length ?? 0
  );

  if (hasRoleReachedLimit || hasScopesPerRoleSurpassedLimit) {
    return (
      <QuotaGuardFooter>
        <Trans
          components={{
            a: <ContactUsPhraseLink />,
            planName: <SkuName skuId={planId} />,
          }}
        >
          {/* User roles limit paywall */}
          {hasRoleReachedLimit &&
            roleType === RoleType.User &&
            t('upsell.paywall.roles', { count: currentSubscriptionQuota.userRolesLimit ?? 0 })}
          {hasRoleReachedLimit &&
            roleType === RoleType.MachineToMachine &&
            t('upsell.paywall.machine_to_machine_roles', {
              count: currentSubscriptionQuota.machineToMachineRolesLimit ?? 0,
            })}
          {/* Role scopes limit paywall */}
          {!hasRoleReachedLimit &&
            hasScopesPerRoleSurpassedLimit &&
            t('upsell.paywall.scopes_per_role', {
              count: currentSubscriptionQuota.scopesPerRoleLimit ?? 0,
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
