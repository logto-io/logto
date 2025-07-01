import { TenantTag } from '@logto/schemas';
import { useContext, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import ConvertLine from '@/assets/icons/convert-line.svg?react';
import { toastResponseError } from '@/cloud/hooks/use-cloud-api';
import { pricingLink } from '@/consts';
import { latestProPlanId } from '@/consts/subscriptions';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import ModalLayout from '@/ds-components/ModalLayout';
import TextLink from '@/ds-components/TextLink';
import useSubscribe from '@/hooks/use-subscribe';
import modalStyles from '@/scss/modal.module.scss';

import TenantEnvTag from '../TenantEnvTag';

import styles from './index.module.scss';

type Props = {
  readonly isOpen: boolean;
  readonly onClose: () => void;
};

function ConvertToProductionModal({ isOpen, onClose }: Props) {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console.upsell.convert_to_production_modal',
  });
  const { t: generalT } = useTranslation(undefined, {
    keyPrefix: 'admin_console.general',
  });

  const [isLoading, setIsLoading] = useState(false);
  const { currentTenant, currentTenantId } = useContext(TenantsContext);
  const { subscribe } = useSubscribe();
  const { logtoSkus } = useContext(SubscriptionDataContext);

  const proSku = useMemo(() => logtoSkus.find(({ id }) => id === latestProPlanId), [logtoSkus]);

  const handleConvert = async () => {
    if (!proSku || !currentTenant) {
      // This should not happen in theory, but just in case
      toast.error(generalT('unknown_error'));
      return;
    }
    setIsLoading(true);
    try {
      await subscribe({
        skuId: proSku.id,
        planId: proSku.id,
        tenantId: currentTenantId,
      });
    } catch (error: unknown) {
      void toastResponseError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ReactModal
      shouldCloseOnEsc
      isOpen={isOpen}
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={onClose}
    >
      <ModalLayout
        title="upsell.convert_to_production_modal.title"
        size="large"
        footer={
          <Button
            type="primary"
            title="upsell.convert_to_production_modal.button"
            isLoading={isLoading}
            onClick={handleConvert}
          />
        }
        onClose={onClose}
      >
        <div className={styles.content}>
          <div className={styles.description}>{t('description')}</div>
          <div className={styles.benefits}>
            <ul className={styles.benefitsList}>
              <li>{t('benefits.stable_environment')}</li>
              <li>
                <Trans
                  components={{
                    a: <TextLink href={pricingLink} targetBlank="noopener" />,
                  }}
                >
                  {t('benefits.keep_pro_features')}
                </Trans>
              </li>
              <li>{t('benefits.no_dev_restrictions')}</li>
            </ul>
          </div>

          <div className={styles.conversionCards}>
            <div className={styles.card}>
              <div className={styles.cardContent}>
                <div className={styles.cardTitle}>{currentTenant?.name}</div>
                <TenantEnvTag isAbbreviated tag={TenantTag.Development} />
              </div>
              <div className={styles.cardDescription}>{t('cards.dev_description')}</div>
            </div>

            <div className={styles.convertWrapper}>
              <ConvertLine className={styles.convertLine} />
              <div className={styles.convertLabel}>{t('cards.convert_label')}</div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardContent}>
                <div className={styles.cardTitle}>{currentTenant?.name}</div>
                <TenantEnvTag isAbbreviated tag={TenantTag.Production} />
              </div>
              <div className={styles.cardDescription}>{t('cards.prod_description')}</div>
            </div>
          </div>
        </div>
      </ModalLayout>
    </ReactModal>
  );
}

export default ConvertToProductionModal;
