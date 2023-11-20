import { type Application, ApplicationType, ReservedPlanId } from '@logto/schemas';
import { useContext, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import useSWR from 'swr';

import ContactUsPhraseLink from '@/components/ContactUsPhraseLink';
import PlanName from '@/components/PlanName';
import QuotaGuardFooter from '@/components/QuotaGuardFooter';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import useSubscriptionPlan from '@/hooks/use-subscription-plan';
import { hasReachedQuotaLimit } from '@/utils/quota';

type Props = {
  selectedType?: ApplicationType;
  isLoading: boolean;
  onClickCreate: () => void;
};

function Footer({ selectedType, isLoading, onClickCreate }: Props) {
  const { currentTenantId } = useContext(TenantsContext);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.upsell.paywall' });
  const { data: currentPlan } = useSubscriptionPlan(currentTenantId);
  const { data: allApplications } = useSWR<Application[]>('api/applications');

  const m2mAppCount = useMemo(
    () =>
      allApplications?.filter(({ type }) => type === ApplicationType.MachineToMachine).length ?? 0,
    [allApplications]
  );

  const nonM2mApplicationCount = allApplications ? allApplications.length - m2mAppCount : 0;

  const isM2mAppsReachLimit = hasReachedQuotaLimit({
    quotaKey: 'machineToMachineLimit',
    plan: currentPlan,
    usage: m2mAppCount,
  });

  const isNonM2mAppsReachLimit = hasReachedQuotaLimit({
    quotaKey: 'applicationsLimit',
    plan: currentPlan,
    usage: nonM2mApplicationCount,
  });

  if (currentPlan && selectedType) {
    const { id: planId, name: planName, quota } = currentPlan;

    if (selectedType === ApplicationType.MachineToMachine && isM2mAppsReachLimit) {
      return (
        <QuotaGuardFooter>
          {quota.machineToMachineLimit === 0 && planId === ReservedPlanId.Free ? (
            <Trans
              components={{
                a: <ContactUsPhraseLink />,
              }}
            >
              {t('machine_to_machine_feature')}
            </Trans>
          ) : (
            <Trans
              components={{
                a: <ContactUsPhraseLink />,
                planName: <PlanName name={planName} />,
              }}
            >
              {t('machine_to_machine', { count: quota.machineToMachineLimit ?? 0 })}
            </Trans>
          )}
        </QuotaGuardFooter>
      );
    }

    if (selectedType !== ApplicationType.MachineToMachine && isNonM2mAppsReachLimit) {
      return (
        <QuotaGuardFooter>
          <Trans
            components={{
              a: <ContactUsPhraseLink />,
              planName: <PlanName name={planName} />,
            }}
          >
            {t('applications', { count: quota.applicationsLimit ?? 0 })}
          </Trans>
        </QuotaGuardFooter>
      );
    }
  }

  return (
    <Button
      isLoading={isLoading}
      htmlType="submit"
      title="applications.create"
      size="large"
      type="primary"
      onClick={onClickCreate}
    />
  );
}

export default Footer;
