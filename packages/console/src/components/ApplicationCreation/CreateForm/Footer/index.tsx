import { ApplicationType, ReservedPlanId } from '@logto/schemas';
import { useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import AddOnNoticeFooter from '@/components/AddOnNoticeFooter';
import ContactUsPhraseLink from '@/components/ContactUsPhraseLink';
import QuotaGuardFooter from '@/components/QuotaGuardFooter';
import SkuName from '@/components/SkuName';
import { officialWebsiteContactPageLink } from '@/consts';
import { isDevFeaturesEnabled } from '@/consts/env';
import { addOnPricingExplanationLink } from '@/consts/external-links';
import {
  machineToMachineAddOnUnitPrice,
  samlApplicationsAddOnUnitPrice,
  thirdPartyApplicationsAddOnUnitPrice,
} from '@/consts/subscriptions';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import Button, { LinkButton } from '@/ds-components/Button';
import TextLink from '@/ds-components/TextLink';
import useApplicationsUsage from '@/hooks/use-applications-usage';
import useUserPreferences from '@/hooks/use-user-preferences';
import { isPaidPlan } from '@/utils/subscription';

import createFormStyles from '../index.module.scss';

import styles from './index.module.scss';

type Props = {
  readonly selectedType?: ApplicationType;
  readonly isLoading: boolean;
  readonly isThirdParty?: boolean;
  readonly onClickCreate: () => void;
};

// eslint-disable-next-line complexity
function Footer({ selectedType, isLoading, onClickCreate, isThirdParty }: Props) {
  const {
    currentSku,
    currentSubscription: { planId, isEnterprisePlan },
    currentSubscriptionQuota,
  } = useContext(SubscriptionDataContext);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.upsell' });
  const {
    hasAppsReachedLimit,
    hasMachineToMachineAppsReachedLimit,
    hasThirdPartyAppsReachedLimit,
    hasSamlAppsReachedLimit,
  } = useApplicationsUsage();
  const {
    data: {
      m2mUpsellNoticeAcknowledged,
      samlAppsUpsellNoticeAcknowledged,
      thirdPartyAppsUpsellNoticeAcknowledged,
    },
    update,
  } = useUserPreferences();

  const isPaidTenant = isPaidPlan(planId, isEnterprisePlan);

  if (selectedType) {
    if (
      selectedType === ApplicationType.MachineToMachine &&
      hasMachineToMachineAppsReachedLimit &&
      // Just in case the enterprise plan has reached the resource limit, we still need to show charge notice.
      isPaidTenant &&
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
              a: <TextLink targetBlank to={addOnPricingExplanationLink} />,
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

    if (selectedType === ApplicationType.SAML && hasSamlAppsReachedLimit) {
      // TODO: remove this dev feature guard after the SAML app add-on feature is available for all plans.
      // For paid plan (pro plan), we don't guard the SAML app creation since it's an add-on feature.
      if (!isDevFeaturesEnabled || currentSku.id === ReservedPlanId.Free) {
        return isDevFeaturesEnabled ? (
          <QuotaGuardFooter>
            <Trans
              components={{
                a: <ContactUsPhraseLink />,
              }}
            >
              {t('paywall.saml_applications_add_on')}
            </Trans>
          </QuotaGuardFooter>
        ) : (
          <div className={createFormStyles.container}>
            <div className={createFormStyles.description}>{t('paywall.saml_applications')}</div>
            <LinkButton
              targetBlank
              size="large"
              type="primary"
              title="general.contact_us_action"
              href={officialWebsiteContactPageLink}
            />
          </div>
        );
      }

      if (isPaidTenant && !samlAppsUpsellNoticeAcknowledged) {
        return (
          <AddOnNoticeFooter
            isLoading={isLoading}
            buttonTitle="applications.create"
            onClick={() => {
              void update({ samlAppsUpsellNoticeAcknowledged: true });
              onClickCreate();
            }}
          >
            <Trans
              components={{
                span: <span className={styles.strong} />,
                a: <TextLink targetBlank to={addOnPricingExplanationLink} />,
              }}
            >
              {t('add_on.footer.saml_apps', {
                price: samlApplicationsAddOnUnitPrice,
              })}
            </Trans>
          </AddOnNoticeFooter>
        );
      }
    }

    if (isThirdParty && hasThirdPartyAppsReachedLimit) {
      // TODO: remove this dev feature guard after the SAML app add-on feature is available for all plans.
      // For paid plan (pro plan), we don't guard the third-party app creation since it's an add-on feature.
      if (!isDevFeaturesEnabled || currentSku.id === ReservedPlanId.Free) {
        // Third party app is only available for paid plan (pro plan).
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

      if (isPaidTenant && !thirdPartyAppsUpsellNoticeAcknowledged) {
        return (
          <AddOnNoticeFooter
            isLoading={isLoading}
            buttonTitle="applications.create"
            onClick={() => {
              void update({ thirdPartyAppsUpsellNoticeAcknowledged: true });
              onClickCreate();
            }}
          >
            <Trans
              components={{
                span: <span className={styles.strong} />,
                a: <TextLink targetBlank to={addOnPricingExplanationLink} />,
              }}
            >
              {t('add_on.footer.third_party_apps', {
                price: thirdPartyApplicationsAddOnUnitPrice,
              })}
            </Trans>
          </AddOnNoticeFooter>
        );
      }
    }

    if (hasAppsReachedLimit) {
      return (
        <QuotaGuardFooter>
          <Trans
            components={{
              a: <ContactUsPhraseLink />,
              planName: <SkuName skuId={planId} />,
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
