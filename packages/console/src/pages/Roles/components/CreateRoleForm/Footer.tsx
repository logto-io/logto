import { RoleType } from '@logto/schemas';
import { useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import ContactUsPhraseLink from '@/components/ContactUsPhraseLink';
import QuotaGuardFooter from '@/components/QuotaGuardFooter';
import SkuName from '@/components/SkuName';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import Button from '@/ds-components/Button';
import {
  hasReachedSubscriptionQuotaLimit,
  hasSurpassedSubscriptionQuotaLimit,
} from '@/utils/quota';

type Props = {
  readonly roleType: RoleType;
  readonly isCreating: boolean;
  readonly onClickCreate: () => void;
};

function Footer({ roleType, isCreating, onClickCreate }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    currentSubscription: { planId, isEnterprisePlan },
    currentSubscriptionQuota,
    currentSubscriptionUsage,
  } = useContext(SubscriptionDataContext);

  const hasRoleReachedLimit = hasReachedSubscriptionQuotaLimit({
    quotaKey: roleType === RoleType.User ? 'userRolesLimit' : 'machineToMachineRolesLimit',
    usage:
      roleType === RoleType.User
        ? currentSubscriptionUsage.userRolesLimit
        : currentSubscriptionUsage.machineToMachineRolesLimit,
    quota: currentSubscriptionQuota,
  });

  const hasScopesPerRoleSurpassedLimit = hasSurpassedSubscriptionQuotaLimit({
    quotaKey: 'scopesPerRoleLimit',
    usage: currentSubscriptionUsage.scopesPerRoleLimit,
    quota: currentSubscriptionQuota,
  });

  if (hasRoleReachedLimit || hasScopesPerRoleSurpassedLimit) {
    return (
      <QuotaGuardFooter>
        <Trans
          components={{
            a: <ContactUsPhraseLink />,
            planName: <SkuName skuId={planId} isEnterprisePlan={isEnterprisePlan} />,
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
