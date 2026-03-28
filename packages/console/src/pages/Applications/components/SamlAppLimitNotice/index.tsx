import { useTranslation } from 'react-i18next';

import { isCloud, isDevFeaturesEnabled } from '@/consts/env';
import { pricingLink } from '@/consts/external-links';
import InlineNotification from '@/ds-components/InlineNotification';

import styles from '../../index.module.scss';
import { getSamlAppLimitNoticeTranslation, shouldShowSamlAppLimitNotice } from '../../utils';

type Props = {
  readonly isThirdPartyTab: boolean;
  readonly samlAppTotalCount?: number;
};

function SamlAppLimitNotice({ isThirdPartyTab, samlAppTotalCount }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const translation = getSamlAppLimitNoticeTranslation();

  const isVisible = shouldShowSamlAppLimitNotice({
    isCloud,
    isDevFeaturesEnabled,
    isThirdPartyTab,
    samlAppTotalCount,
  });

  if (!isVisible) {
    return null;
  }

  return (
    <InlineNotification
      className={styles.notice}
      severity="info"
      action="upsell.view_plans"
      onClick={() => {
        window.open(pricingLink, '_blank', 'noopener,noreferrer');
      }}
    >
      {t(translation.key, translation.interpolation)}
    </InlineNotification>
  );
}

export default SamlAppLimitNotice;
