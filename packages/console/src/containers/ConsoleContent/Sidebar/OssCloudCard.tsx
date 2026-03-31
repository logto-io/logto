import { Theme } from '@logto/schemas';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import CloseIcon from '@/assets/icons/close.svg?react';
import CloudIconDark from '@/assets/icons/cloud-icon-dark.svg?react';
import CloudIcon from '@/assets/icons/cloud-icon.svg?react';
import ExternalLinkIcon from '@/assets/icons/external-link.svg?react';
import { isCloud, isDevFeaturesEnabled } from '@/consts/env';
import IconButton from '@/ds-components/IconButton';
import TextLink from '@/ds-components/TextLink';
import useTheme from '@/hooks/use-theme';
import useUserPreferences from '@/hooks/use-user-preferences';

import { shouldShowOssCloudSidebarCard } from './oss-cloud-card';
import styles from './oss-cloud-card.module.scss';

const logtoCloudConsoleUrl = 'https://cloud.logto.io';

const icons = {
  [Theme.Light]: CloudIcon,
  [Theme.Dark]: CloudIconDark,
};

function OssCloudCard() {
  const { t: tSidebar } = useTranslation(undefined, {
    keyPrefix: 'admin_console.get_started.oss_cloud.sidebar',
  });
  const { t: tGeneral } = useTranslation(undefined, { keyPrefix: 'admin_console.general' });
  const theme = useTheme();
  const { data: userPreferences, isLoaded, update } = useUserPreferences();
  const CloudBannerIcon = icons[theme];

  if (
    !shouldShowOssCloudSidebarCard({
      isCloud,
      isDevFeaturesEnabled,
      isUserPreferencesLoaded: isLoaded,
      isDismissed: Boolean(userPreferences.ossSidebarCloudUpsellDismissed),
    })
  ) {
    return null;
  }

  const onDismiss = async () => {
    try {
      await update({ ossSidebarCloudUpsellDismissed: true });
    } catch (error: unknown) {
      void error;
    }
  };

  return (
    <div className={classNames(styles.wrapper, isDevFeaturesEnabled && styles.withDevStatusOffset)}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.icon}>
            <CloudBannerIcon />
          </div>
          <IconButton
            size="small"
            aria-label={tGeneral('close')}
            className={styles.dismissButton}
            onClick={() => {
              void onDismiss();
            }}
          >
            <CloseIcon className={styles.dismissIcon} />
          </IconButton>
        </div>
        <div className={styles.title}>{tSidebar('title')}</div>
        <div className={styles.description}>{tSidebar('description')}</div>
        <TextLink
          isTrailingIcon
          className={styles.link}
          href={logtoCloudConsoleUrl}
          icon={<ExternalLinkIcon className={styles.linkIcon} />}
          targetBlank="noopener"
        >
          {tSidebar('action')}
        </TextLink>
      </div>
    </div>
  );
}

export default OssCloudCard;
