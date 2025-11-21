import { useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import ContactUsPhraseLink from '@/components/ContactUsPhraseLink';
import SkuName from '@/components/SkuName';
import { addOnPricingExplanationLink } from '@/consts';
import { customDomainAddOnUnitPrice } from '@/consts/subscriptions';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import InlineNotification from '@/ds-components/InlineNotification';
import TextLink from '@/ds-components/TextLink';
import usePaywall from '@/hooks/use-paywall';
import useTenantPathname from '@/hooks/use-tenant-pathname';

import styles from './index.module.scss';

export default function PaywallNotification() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { navigate } = useTenantPathname();
  const { isFreeTenant, isPaidTenant } = usePaywall();
  const {
    currentSubscription: { planId },
    currentSubscriptionQuota,
  } = useContext(SubscriptionDataContext);

  if (isFreeTenant) {
    return (
      <InlineNotification
        action="upsell.view_plans"
        actionButtonProps={{
          type: 'text',
        }}
        className={styles.paywallNotification}
        onClick={() => {
          navigate('/tenant-settings/subscription');
        }}
      >
        <Trans
          components={{
            a: <ContactUsPhraseLink />,
            planName: <SkuName skuId={planId} />,
          }}
        >
          {t('upsell.paywall.custom_domain', {
            count: currentSubscriptionQuota.customDomainsLimit ?? 0,
          })}
        </Trans>
      </InlineNotification>
    );
  }

  if (isPaidTenant) {
    return (
      <InlineNotification className={styles.paywallNotification}>
        <Trans
          components={{
            a: <TextLink to={addOnPricingExplanationLink} />,
          }}
        >
          {t('upsell.add_on.custom_domain', { price: customDomainAddOnUnitPrice })}
        </Trans>
      </InlineNotification>
    );
  }

  return null;
}
