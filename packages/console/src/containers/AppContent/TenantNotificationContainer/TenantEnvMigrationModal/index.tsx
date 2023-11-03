import { Theme } from '@logto/schemas';
import { useCallback } from 'react';
import Confetti from 'react-confetti';
import { Trans, useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import CongratsDark from '@/assets/images/congrats-dark.svg';
import Congrats from '@/assets/images/congrats.svg';
import StagingFireworks from '@/assets/images/tenant-modal-fireworks-staging.svg';
import Fireworks from '@/assets/images/tenant-modal-fireworks.svg';
import { contactEmailLink } from '@/consts';
import Button from '@/ds-components/Button';
import DangerousRaw from '@/ds-components/DangerousRaw';
import ModalLayout from '@/ds-components/ModalLayout';
import useTheme from '@/hooks/use-theme';
import * as modalStyles from '@/scss/modal.module.scss';

import DevelopmentTenantFeatures from './DevelopmentTenantFeatures';
import DevelopmentTenantMigrationHint from './DevelopmentTenantMigrationHint';
import * as styles from './index.module.scss';
import { type MigrationType } from './types';

const type: MigrationType = 'existingFreeDevelopmentTenant';

const isDisplayFeatures = (type: MigrationType) =>
  type === 'existingFreeDevelopmentTenant' || type === 'existingFreeProductionTenant';

function TenantEnvMigrationModal() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const theme = useTheme();
  const HeaderIcon = theme === Theme.Light ? Congrats : CongratsDark;

  const onClose = useCallback(() => {
    console.log('Fuck');
  }, []);

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
              {!isDisplayFeatures(type) && (
                <a href={contactEmailLink} className={styles.linkButton} rel="noopener">
                  <Button title="general.contact_us_action" size="large" />
                </a>
              )}
              <Button
                title={
                  isDisplayFeatures(type)
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
            {isDisplayFeatures(type) ? (
              <DevelopmentTenantFeatures />
            ) : (
              <DevelopmentTenantMigrationHint type={type} />
            )}
          </div>
        </ModalLayout>
        <div className={styles.fireworks}>
          {type === 'existingFreeStagingTenant' ? (
            <StagingFireworks className={styles.stagingFireworksImage} />
          ) : (
            <Fireworks className={styles.fireworksImage} />
          )}
        </div>
      </div>
      <Confetti recycle={false} />
    </ReactModal>
  );
}

export default TenantEnvMigrationModal;
