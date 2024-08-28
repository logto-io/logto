import { Theme } from '@logto/schemas';
import { useCallback } from 'react';
import Confetti from 'react-confetti';
import { Trans, useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import CongratsDark from '@/assets/images/congrats-dark.svg';
import Congrats from '@/assets/images/congrats.svg';
import Fireworks from '@/assets/images/tenant-modal-fireworks.svg';
import { envTagsFeatureLink } from '@/consts';
import Button, { LinkButton } from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';
import ModalLayout from '@/ds-components/ModalLayout';
import useConfigs from '@/hooks/use-configs';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import useTheme from '@/hooks/use-theme';
import * as modalStyles from '@/scss/modal.module.scss';

import * as styles from './index.module.scss';

/**
 * This modal is used to notify the user that the tenant env has been migrated.
 *
 * In our new development tenant feature, the old tenant env `staging` is deprecated,
 * we migrated the existing paid tenant's env to 'production', and the existing free 'staging' tenant's env to 'production'.
 *
 * For the original paid and free staging tenants, we will show the migration hint to notify the user that the tenant env has been migrated to 'production'.
 */
function TenantEnvMigrationModal() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const theme = useTheme();
  const HeaderIcon = theme === Theme.Light ? Congrats : CongratsDark;
  const { configs, updateConfigs } = useConfigs();
  const { developmentTenantMigrationNotification: migrationData } = configs ?? {};
  const { getDocumentationUrl } = useDocumentationUrl();

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
          title="tenants.dev_tenant_migration.title"
          footer={
            <>
              <LinkButton
                title="tenants.dev_tenant_migration.about_tenant_type"
                size="large"
                href={getDocumentationUrl(envTagsFeatureLink)}
                targetBlank="noopener"
              />
              <Button title="general.got_it" size="large" type="primary" onClick={onClose} />
            </>
          }
          onClose={onClose}
        >
          <div className={styles.content}>
            <div className={styles.title}>
              <DynamicT forKey="tenants.dev_tenant_migration.affect_title" />
            </div>
            <div className={styles.hint}>
              <div>
                <Trans components={{ strong: <span className={styles.strong} /> }}>
                  {t('tenants.dev_tenant_migration.hint_1')}
                </Trans>
              </div>
              <div>
                <Trans components={{ strong: <span className={styles.strong} /> }}>
                  {t('tenants.dev_tenant_migration.hint_2')}
                </Trans>
              </div>
              <div>{t('tenants.dev_tenant_migration.hint_3')}</div>
            </div>
          </div>
        </ModalLayout>
        <div className={styles.fireworks}>
          <Fireworks className={styles.fireworksImage} />
        </div>
      </div>
      <Confetti recycle={false} />
    </ReactModal>
  );
}

export default TenantEnvMigrationModal;
