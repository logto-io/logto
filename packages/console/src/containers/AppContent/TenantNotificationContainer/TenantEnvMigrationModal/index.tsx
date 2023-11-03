import { Theme, TenantTag } from '@logto/schemas';
import { useCallback } from 'react';
import Confetti from 'react-confetti';
import { Trans, useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import CongratsDark from '@/assets/images/congrats-dark.svg';
import Congrats from '@/assets/images/congrats.svg';
import Fireworks from '@/assets/images/tenant-modal-fireworks.svg';
import { contactEmailLink } from '@/consts';
import Button from '@/ds-components/Button';
import DangerousRaw from '@/ds-components/DangerousRaw';
import ModalLayout from '@/ds-components/ModalLayout';
import useConfigs from '@/hooks/use-configs';
import useTheme from '@/hooks/use-theme';
import * as modalStyles from '@/scss/modal.module.scss';

import DevelopmentTenantFeatures from './DevelopmentTenantFeatures';
import DevelopmentTenantMigrationHint from './DevelopmentTenantMigrationHint';
import * as styles from './index.module.scss';

const isFreeTenantWithDevelopmentOrProductionEnvTag = (
  originalTenantTag: TenantTag,
  isPaidTenant: boolean
) => !isPaidTenant && [TenantTag.Development, TenantTag.Production].includes(originalTenantTag);

/**
 * This modal is used to notify the user that the tenant env has been migrated.
 *
 * In our new development tenant feature, the old tenant env `staging` is deprecated,
 * we migrated the existing paid tenant's env to 'production', and the existing free 'staging' tenant's env to 'production'.
 *
 * For the original free tenant:
 *  - If the tenant env is 'dev' or 'production', we will show the development tenant's available feature list.
 *  - If the tenant env is 'staging', we will show the migration hint to notify the user that the tenant env has been migrated to 'production'.
 *
 * For the original paid tenant, we will show the migration hint to notify the user that the tenant env has been migrated to 'production'.
 */
function TenantEnvMigrationModal() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const theme = useTheme();
  const HeaderIcon = theme === Theme.Light ? Congrats : CongratsDark;
  const { configs, updateConfigs } = useConfigs();
  const { developmentTenantMigrationNotification: migrationData } = configs ?? {};

  const onClose = useCallback(async () => {
    if (!migrationData) {
      return;
    }
    await updateConfigs({
      developmentTenantMigrationNotification: {
        ...migrationData,
        readAt: Date.now(),
      },
    });
  }, [migrationData, updateConfigs]);

  if (!migrationData || migrationData.readAt) {
    return null;
  }

  const { tag: originalTenantTag, isPaidTenant } = migrationData;

  const shouldDisplayDevelopmentTenantFeatureList = isFreeTenantWithDevelopmentOrProductionEnvTag(
    originalTenantTag,
    isPaidTenant
  );

  return (
    <ReactModal
      isOpen
      shouldCloseOnEsc
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={onClose}
    >
      <div className={styles.modalLayoutWrapper}>
        <ModalLayout
          isWordWrapEnabled
          headerIcon={<HeaderIcon className={styles.headerIcon} />}
          title={
            <DangerousRaw>
              <Trans components={{ span: <span className={styles.highlight} /> }}>
                {t('tenants.notification.allow_pro_features_title')}
              </Trans>
            </DangerousRaw>
          }
          subtitle="tenants.notification.allow_pro_features_description"
          footer={
            <>
              {!shouldDisplayDevelopmentTenantFeatureList && (
                <a href={contactEmailLink} className={styles.linkButton} rel="noopener">
                  <Button title="general.contact_us_action" size="large" />
                </a>
              )}
              <Button
                title={
                  shouldDisplayDevelopmentTenantFeatureList
                    ? 'tenants.notification.explore_all_features'
                    : 'general.got_it'
                }
                size="large"
                type="primary"
                onClick={onClose}
              />
            </>
          }
          onClose={onClose}
        >
          <div className={styles.content}>
            {isPaidTenant && <DevelopmentTenantMigrationHint type="paidTenant" />}
            {!isPaidTenant &&
              [TenantTag.Development, TenantTag.Production].includes(originalTenantTag) && (
                <DevelopmentTenantFeatures />
              )}
            {!isPaidTenant && originalTenantTag === TenantTag.Staging && (
              <DevelopmentTenantMigrationHint type="freeStagingTenant" />
            )}
          </div>
        </ModalLayout>
        <div className={styles.fireworks}>
          <Fireworks
            className={
              !isPaidTenant && originalTenantTag === TenantTag.Staging
                ? styles.stagingFireworksImage
                : styles.fireworksImage
            }
          />
        </div>
      </div>
      <Confetti recycle={false} />
    </ReactModal>
  );
}

export default TenantEnvMigrationModal;
