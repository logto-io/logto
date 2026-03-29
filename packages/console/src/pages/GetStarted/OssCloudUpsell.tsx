import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import CloseIcon from '@/assets/icons/close.svg?react';
import ExternalLinkIcon from '@/assets/icons/external-link.svg?react';
import LighteningIcon from '@/assets/icons/lightening.svg?react';
import PrivateCloudIcon from '@/assets/icons/private-cloud.svg?react';
import SparklesIcon from '@/assets/icons/sparkles.svg?react';
import { officialWebsiteContactPageLink } from '@/consts';
import Button, { LinkButton } from '@/ds-components/Button';
import Card from '@/ds-components/Card';
import IconButton from '@/ds-components/IconButton';
import Spacer from '@/ds-components/Spacer';
import Tag from '@/ds-components/Tag';

import styles from './index.module.scss';

type Props = {
  readonly isBannerVisible: boolean;
  readonly onDismissBanner: () => void;
};

const logtoCloudConsoleUrl = 'https://cloud.logto.io';

function OssCloudUpsell({ isBannerVisible, onDismissBanner }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <>
      {isBannerVisible && (
        <Card className={classNames(styles.card, styles.ossCloudBanner)}>
          <div className={styles.ossCloudBannerContent}>
            <div className={styles.ossCloudBannerMain}>
              <div className={styles.ossCloudBannerIcon}>
                <SparklesIcon />
              </div>
              <div className={styles.columnWrapper}>
                <div className={styles.ossCloudBannerTitleRow}>
                  <div className={styles.bannerTitle}>{t('get_started.oss_cloud.try.title')}</div>
                  <Tag variant="plain" size="small" className={styles.recommendedTag}>
                    <LighteningIcon className={styles.recommendedTagIcon} />
                    {t('get_started.oss_cloud.try.badge')}
                  </Tag>
                </div>
                <div className={styles.bodyText}>{t('get_started.oss_cloud.try.description')}</div>
              </div>
            </div>
            <div className={styles.ossCloudBannerActions}>
              <Button
                type="primary"
                title="get_started.oss_cloud.try.action"
                trailingIcon={<ExternalLinkIcon className={styles.bannerActionIcon} />}
                onClick={() => {
                  window.open(logtoCloudConsoleUrl, '_blank', 'noopener,noreferrer');
                }}
              />
            </div>
          </div>
          <IconButton
            size="small"
            aria-label={t('general.close')}
            className={styles.dismissButton}
            onClick={onDismissBanner}
          >
            <CloseIcon className={styles.dismissIcon} />
          </IconButton>
        </Card>
      )}
      <Card className={styles.card}>
        <div className={styles.title}>{t('get_started.oss_cloud.private_cloud.title')}</div>
        <div className={classNames(styles.borderBox, styles.privateCloudCard)}>
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
