import { useContext } from 'react';

import SamlAppLimitBanner from '@/components/SamlAppLimitBanner';
import { isCloud } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';

import styles from '../../index.module.scss';
import { shouldShowSamlAppLimitNotice } from '../../utils';

type Props = {
  readonly isThirdPartyTab: boolean;
  readonly samlAppTotalCount?: number;
};

function SamlAppLimitNotice({ isThirdPartyTab, samlAppTotalCount }: Props) {
  const {
    currentSubscriptionQuota: { samlApplicationsLimit },
  } = useContext(SubscriptionDataContext);

  if (
    samlApplicationsLimit === null ||
    !shouldShowSamlAppLimitNotice({
      isCloud,
      isThirdPartyTab,
      samlAppLimit: samlApplicationsLimit,
      samlAppTotalCount,
    })
  ) {
    return null;
  }

  return (
    <SamlAppLimitBanner className={styles.notice} variant="inline" limit={samlApplicationsLimit} />
  );
}

export default SamlAppLimitNotice;
