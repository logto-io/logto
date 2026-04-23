import { Theme } from '@logto/schemas';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import CloseIcon from '@/assets/icons/close.svg?react';
import CloudIconDark from '@/assets/icons/cloud-icon-dark.svg?react';
import CloudIcon from '@/assets/icons/cloud-icon.svg?react';
import ExternalLinkIcon from '@/assets/icons/external-link.svg?react';
import LighteningIcon from '@/assets/icons/lightening.svg?react';
import PrivateCloudIcon from '@/assets/icons/private-cloud.svg?react';
import { officialWebsiteContactPageLink } from '@/consts';
import Button, { LinkButton } from '@/ds-components/Button';
import Card from '@/ds-components/Card';
import IconButton from '@/ds-components/IconButton';
import Spacer from '@/ds-components/Spacer';
import Tag from '@/ds-components/Tag';
import useTheme from '@/hooks/use-theme';
import { openCloudUpsell, ossUpsellEntries } from '@/utils/oss-upsell';

import styles from './index.module.scss';

type Props = {
  readonly isBannerVisible: boolean;
  readonly onDismissBanner: () => void;
};

const icons = {
  [Theme.Light]: CloudIcon,
  [Theme.Dark]: CloudIconDark,
};

function OssCloudUpsell({ isBannerVisible, onDismissBanner }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const theme = useTheme();
  const CloudBannerIcon = icons[theme];

  return (
    <>
      {isBannerVisible && (
        <Card className={classNames(styles.card, styles.ossCloudBanner)}>
          <div className={styles.ossCloudBannerContent}>
            <div className={styles.ossCloudBannerMain}>
              <div className={styles.ossCloudBannerIcon}>
                <CloudBannerIcon />
              </div>
              <div className={styles.columnWrapper}>
                <div className={styles.ossCloudBannerTitleRow}>
                  <div className={styles.bannerTitle}>{t('get_started.oss_cloud.try.title')}</div>
                  <Tag variant="plain" size="small" className={styles.recommendedTag}>
                    <LighteningIcon className={styles.recommendedTagIcon} />
                    {t('get_started.oss_cloud.try.badge')}
                  </Tag>
                </div>
                <div className={styles.ossCloudBannerDescription}>
                  {t('get_started.oss_cloud.try.description')}
                </div>
              </div>
            </div>
            <div className={styles.ossCloudBannerActions}>
              <Button
                type="primary"
                size="large"
                title="get_started.oss_cloud.try.action"
                trailingIcon={<ExternalLinkIcon className={styles.bannerActionIcon} />}
                onClick={() => {
                  openCloudUpsell({
                    entry: ossUpsellEntries.getStartedOssCloudBanner,
                  });
                }}
              />
            </div>
          </div>
          <IconButton
            size="small"
            aria-label={t('general.close')}
            className={styles.dismissButton}
            iconClassName={styles.dismissButtonIcon}
            onClick={onDismissBanner}
          >
            <CloseIcon className={styles.dismissIcon} />
          </IconButton>
        </Card>
      )}
      <Card className={styles.card}>
        <div className={styles.title}>{t('get_started.oss_cloud.private_cloud.title')}</div>
        <div className={styles.borderBox}>
          <div className={styles.rowWrapper}>
            <div className={classNames(styles.icon, styles.privateCloudIcon)}>
              <PrivateCloudIcon />
            </div>
            <div className={styles.columnWrapper}>
              <div className={styles.title}>
                {t('get_started.oss_cloud.private_cloud.card_title')}
              </div>
              <div className={styles.bodyText}>
                {t('get_started.oss_cloud.private_cloud.description')}
              </div>
            </div>
          </div>
          <Spacer />
          <LinkButton
            title="general.contact_us_action"
            href={officialWebsiteContactPageLink}
            type="outline"
            targetBlank="noopener"
          />
        </div>
      </Card>
    </>
  );
}

export default OssCloudUpsell;
