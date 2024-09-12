import { useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import ContactUsPhraseLink from '@/components/ContactUsPhraseLink';
import QuotaGuardFooter from '@/components/QuotaGuardFooter';
import SkuName from '@/components/SkuName';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import Button from '@/ds-components/Button';
import { hasReachedSubscriptionQuotaLimit } from '@/utils/quota';

type Props = {
  readonly isCreatingSocialConnector: boolean;
  readonly isCreateButtonDisabled: boolean;
  readonly onClickCreateButton: () => void;
};

function Footer({ isCreatingSocialConnector, isCreateButtonDisabled, onClickCreateButton }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.upsell.paywall' });
  const {
    currentSubscription: { planId, isEnterprisePlan },
    currentSubscriptionUsage,
    currentSubscriptionQuota,
  } = useContext(SubscriptionDataContext);

  const isSocialConnectorsReachLimit = hasReachedSubscriptionQuotaLimit({
    quotaKey: 'socialConnectorsLimit',
    usage: currentSubscriptionUsage.socialConnectorsLimit,
    quota: currentSubscriptionQuota,
  });

  if (isCreatingSocialConnector && isSocialConnectorsReachLimit) {
    return (
      <QuotaGuardFooter>
        <Trans
          components={{
            a: <ContactUsPhraseLink />,
            planName: <SkuName skuId={planId} isEnterprisePlan={isEnterprisePlan} />,
          }}
        >
          {t('social_connectors', {
            count: currentSubscriptionQuota.socialConnectorsLimit ?? 0,
          })}
        </Trans>
      </QuotaGuardFooter>
    );
  }

  return (
    <Button
      title="general.next"
      type="primary"
      disabled={isCreateButtonDisabled}
      onClick={onClickCreateButton}
    />
  );
}

export default Footer;
