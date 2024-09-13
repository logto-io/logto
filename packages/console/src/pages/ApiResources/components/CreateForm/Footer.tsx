import { ReservedPlanId } from '@logto/schemas';
import { useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import AddOnNoticeFooter from '@/components/AddOnNoticeFooter';
import ContactUsPhraseLink from '@/components/ContactUsPhraseLink';
import QuotaGuardFooter from '@/components/QuotaGuardFooter';
import SkuName from '@/components/SkuName';
import { addOnPricingExplanationLink } from '@/consts/external-links';
import { resourceAddOnUnitPrice } from '@/consts/subscriptions';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import Button from '@/ds-components/Button';
import TextLink from '@/ds-components/TextLink';
import useApiResourcesUsage from '@/hooks/use-api-resources-usage';
import useUserPreferences from '@/hooks/use-user-preferences';
import { isPaidPlan } from '@/utils/subscription';

import styles from './index.module.scss';

type Props = {
  readonly isCreationLoading: boolean;
  readonly onClickCreate: () => void;
};

function Footer({ isCreationLoading, onClickCreate }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    currentSubscription: { planId, isAddOnAvailable, isEnterprisePlan },
    currentSubscriptionUsage: { resourcesLimit },
    currentSku,
  } = useContext(SubscriptionDataContext);
  const { hasReachedLimit } = useApiResourcesUsage();
  const {
    data: { apiResourceUpsellNoticeAcknowledged },
    update,
  } = useUserPreferences();

  if (
    hasReachedLimit &&
    /**
     * We don't guard API resources quota limit for paid plan, since it's an add-on feature
     */
    currentSku.id === ReservedPlanId.Free
  ) {
    return (
      <QuotaGuardFooter>
        <Trans
          components={{
            a: <ContactUsPhraseLink />,
            planName: <SkuName skuId={planId} isEnterprisePlan={isEnterprisePlan} />,
          }}
        >
          {t('upsell.paywall.resources', {
            count: resourcesLimit,
          })}
        </Trans>
      </QuotaGuardFooter>
    );
  }

  if (
    isAddOnAvailable &&
    hasReachedLimit &&
    // Just in case the enterprise plan has reached the resource limit, we still need to show charge notice.
    isPaidPlan(planId, isEnterprisePlan) &&
    !apiResourceUpsellNoticeAcknowledged
  ) {
    return (
      <AddOnNoticeFooter
        isLoading={isCreationLoading}
        buttonTitle="api_resources.create"
        onClick={() => {
          void update({ apiResourceUpsellNoticeAcknowledged: true });
          onClickCreate();
        }}
      >
        <Trans
          components={{
            span: <span className={styles.strong} />,
            a: <TextLink to={addOnPricingExplanationLink} />,
          }}
        >
          {t('upsell.add_on.footer.api_resource', {
            price: resourceAddOnUnitPrice,
          })}
        </Trans>
      </AddOnNoticeFooter>
    );
  }

  return (
    <Button
      isLoading={isCreationLoading}
      htmlType="submit"
      title="api_resources.create"
      size="large"
      type="primary"
      onClick={onClickCreate}
    />
  );
}

export default Footer;
