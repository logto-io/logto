import { Trans, useTranslation } from 'react-i18next';

import ContactUsPhraseLink from '@/components/ContactUsPhraseLink';
import { securityFeaturesAddOnUnitPrice } from '@/consts/subscriptions';
import InlineNotification from '@/ds-components/InlineNotification';
import usePaywall from '@/hooks/use-paywall';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import useUserPreferences from '@/hooks/use-user-preferences';

type Props = {
  readonly className?: string;
};

function PaywallNotification({ className }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { navigate } = useTenantPathname();

  const { isFreeTenant, isPaidTenant } = usePaywall();

  const {
    data: { sencurityFeaturesUpsellNoticeAcknowledged },
    update,
  } = useUserPreferences();

  if (isFreeTenant) {
    return (
      <InlineNotification
        className={className}
        action="upsell.upgrade_plan"
        actionButtonProps={{
          type: 'primary',
          size: 'medium',
        }}
        onClick={() => {
          navigate('/tenant-settings/subscription');
        }}
      >
        <Trans
          components={{
            a: <ContactUsPhraseLink />,
          }}
        >
          {t('upsell.paywall.security_features')}
        </Trans>
      </InlineNotification>
    );
  }

  if (isPaidTenant && !sencurityFeaturesUpsellNoticeAcknowledged) {
    return (
      <InlineNotification
        className={className}
        action="general.got_it"
        onClick={async () => update({ sencurityFeaturesUpsellNoticeAcknowledged: true })}
      >
        {t('upsell.add_on.security_features_inline_notification', {
          price: securityFeaturesAddOnUnitPrice,
        })}
      </InlineNotification>
    );
  }

  return null;
}

export default PaywallNotification;
