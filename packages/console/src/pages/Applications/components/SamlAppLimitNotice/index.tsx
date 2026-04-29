import SamlAppLimitBanner from '@/components/SamlAppLimitBanner';
import { ossSamlApplicationsLimit } from '@/consts/application-limits';
import { isCloud } from '@/consts/env';

import styles from '../../index.module.scss';
import { shouldShowSamlAppLimitNotice } from '../../utils';

type Props = {
  readonly isThirdPartyTab: boolean;
  readonly samlAppTotalCount?: number;
};

function SamlAppLimitNotice({ isThirdPartyTab, samlAppTotalCount }: Props) {
  const isVisible = shouldShowSamlAppLimitNotice({
    isCloud,
    isThirdPartyTab,
    samlAppTotalCount,
  });

  if (!isVisible) {
    return null;
  }

  return (
    <SamlAppLimitBanner
      className={styles.notice}
      variant="inline"
      limit={ossSamlApplicationsLimit}
    />
  );
}

export default SamlAppLimitNotice;
