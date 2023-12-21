import { ApplicationType, ReservedPlanId } from '@logto/schemas';
import { useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import ContactUsPhraseLink from '@/components/ContactUsPhraseLink';
import PlanName from '@/components/PlanName';
import QuotaGuardFooter from '@/components/QuotaGuardFooter';
import { isDevFeaturesEnabled } from '@/consts/env';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import useApplicationsUsage from '@/hooks/use-applications-usage';
import useSubscriptionPlan from '@/hooks/use-subscription-plan';

type Props = {
  selectedType?: ApplicationType;
  isLoading: boolean;
  onClickCreate: () => void;
};

function Footer({ selectedType, isLoading, onClickCreate }: Props) {
  const { currentTenantId } = useContext(TenantsContext);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.upsell.paywall' });
  const { data: currentPlan } = useSubscriptionPlan(currentTenantId);
  const { hasAppsReachedLimit, hasMachineToMachineAppsReachedLimit } = useApplicationsUsage();

  if (currentPlan && selectedType) {
    const { id: planId, name: planName, quota } = currentPlan;

    if (selectedType === ApplicationType.MachineToMachine && hasMachineToMachineAppsReachedLimit) {
      // Todo @xiaoyijun [Pricing] Remove feature flag
      if (isDevFeaturesEnabled && planId === ReservedPlanId.Free) {
        return (
          <QuotaGuardFooter>
            <Trans
              components={{
                a: <ContactUsPhraseLink />,
              }}
            >
              {t('machine_to_machine_feature')}
            </Trans>
          </QuotaGuardFooter>
        );
      }

      /**
       * Todo @xiaoyijun [Pricing] Remove feature flag
       * For paid plan (pro plan), we don't guard the m2m app creation since it's an add-on feature.
       */
      if (!isDevFeaturesEnabled) {
        // Todo @xiaoyijun [Pricing] Deprecate this logic when pricing is ready
        return (
          <QuotaGuardFooter>
            {quota.machineToMachineLimit === 0 && planId === ReservedPlanId.Free ? (
              <Trans
                components={{
                  a: <ContactUsPhraseLink />,
                }}
              >
                {t('deprecated_machine_to_machine_feature')}
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
    }

    if (hasAppsReachedLimit) {
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
