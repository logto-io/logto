import { ApplicationType, ReservedPlanId } from '@logto/schemas';
import { useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import ContactUsPhraseLink from '@/components/ContactUsPhraseLink';
import PlanName from '@/components/PlanName';
import QuotaGuardFooter from '@/components/QuotaGuardFooter';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import Button from '@/ds-components/Button';
import useApplicationsUsage from '@/hooks/use-applications-usage';

type Props = {
  selectedType?: ApplicationType;
  isLoading: boolean;
  onClickCreate: () => void;
};

function Footer({ selectedType, isLoading, onClickCreate }: Props) {
  const { currentPlan } = useContext(SubscriptionDataContext);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.upsell.paywall' });
  const { hasAppsReachedLimit, hasMachineToMachineAppsReachedLimit } = useApplicationsUsage();

  if (selectedType) {
    const { id: planId, name: planName, quota } = currentPlan;

    if (
      selectedType === ApplicationType.MachineToMachine &&
      hasMachineToMachineAppsReachedLimit &&
      // For paid plan (pro plan), we don't guard the m2m app creation since it's an add-on feature.
      planId === ReservedPlanId.Free
    ) {
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
