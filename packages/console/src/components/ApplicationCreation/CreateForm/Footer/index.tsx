import { ApplicationType, ReservedPlanId } from '@logto/schemas';
import { useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import AddOnNoticeFooter from '@/components/AddOnNoticeFooter';
import ContactUsPhraseLink from '@/components/ContactUsPhraseLink';
import QuotaGuardFooter from '@/components/QuotaGuardFooter';
import SkuName from '@/components/SkuName';
import { addOnPricingExplanationLink } from '@/consts/external-links';
import { machineToMachineAddOnUnitPrice } from '@/consts/subscriptions';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import Button from '@/ds-components/Button';
import TextLink from '@/ds-components/TextLink';
import useApplicationsUsage from '@/hooks/use-applications-usage';
import useUserPreferences from '@/hooks/use-user-preferences';
import { isPaidPlan } from '@/utils/subscription';

import styles from './index.module.scss';

type Props = {
  readonly selectedType?: ApplicationType;
  readonly isLoading: boolean;
  readonly isThirdParty?: boolean;
  readonly onClickCreate: () => void;
};

function Footer({ selectedType, isLoading, onClickCreate, isThirdParty }: Props) {
  const {
    currentSku,
    currentSubscription: { planId, isAddOnAvailable, isEnterprisePlan },
    currentSubscriptionQuota,
  } = useContext(SubscriptionDataContext);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.upsell' });
  const {
    hasAppsReachedLimit,
    hasMachineToMachineAppsReachedLimit,
    hasThirdPartyAppsReachedLimit,
  } = useApplicationsUsage();
  const {
    data: { m2mUpsellNoticeAcknowledged },
    update,
  } = useUserPreferences();

  if (selectedType) {
    if (
      selectedType === ApplicationType.MachineToMachine &&
      isAddOnAvailable &&
      hasMachineToMachineAppsReachedLimit &&
      // Just in case the enterprise plan has reached the resource limit, we still need to show charge notice.
      isPaidPlan(planId, isEnterprisePlan) &&
      !m2mUpsellNoticeAcknowledged
    ) {
      return (
        <AddOnNoticeFooter
          isLoading={isLoading}
          buttonTitle="applications.create"
          onClick={() => {
            void update({ m2mUpsellNoticeAcknowledged: true });
            onClickCreate();
          }}
        >
          <Trans
            components={{
              span: <span className={styles.strong} />,
              a: <TextLink to={addOnPricingExplanationLink} />,
            }}
          >
            {t('add_on.footer.machine_to_machine_app', {
              price: machineToMachineAddOnUnitPrice,
            })}
          </Trans>
        </AddOnNoticeFooter>
      );
    }

    if (
      selectedType === ApplicationType.MachineToMachine &&
      hasMachineToMachineAppsReachedLimit &&
      // For paid plan (pro plan), we don't guard the m2m app creation since it's an add-on feature.
      currentSku.id === ReservedPlanId.Free
    ) {
      return (
        <QuotaGuardFooter>
          <Trans
            components={{
              a: <ContactUsPhraseLink />,
            }}
          >
            {t('paywall.machine_to_machine_feature')}
          </Trans>
        </QuotaGuardFooter>
      );
    }

    // Third party app is only available for paid plan (pro plan).
    if (isThirdParty && hasThirdPartyAppsReachedLimit) {
      return (
        <QuotaGuardFooter>
          <Trans
            components={{
              a: <ContactUsPhraseLink />,
            }}
          >
            {t('paywall.third_party_apps')}
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
              planName: <SkuName skuId={planId} isEnterprisePlan={isEnterprisePlan} />,
            }}
          >
            {t('paywall.applications', { count: currentSubscriptionQuota.applicationsLimit ?? 0 })}
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
