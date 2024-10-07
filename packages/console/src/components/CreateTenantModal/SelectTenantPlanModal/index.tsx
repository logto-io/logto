import { ReservedPlanId } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import Modal from 'react-modal';

import { useCloudApi, toastResponseError } from '@/cloud/hooks/use-cloud-api';
import { type TenantResponse, type LogtoSkuResponse } from '@/cloud/types/router';
import { GtagConversionId, reportToGoogle } from '@/components/Conversion/utils';
import { pricingLink } from '@/consts';
import DangerousRaw from '@/ds-components/DangerousRaw';
import ModalLayout from '@/ds-components/ModalLayout';
import TextLink from '@/ds-components/TextLink';
import useLogtoSkus from '@/hooks/use-logto-skus';
import useSubscribe from '@/hooks/use-subscribe';
import modalStyles from '@/scss/modal.module.scss';
import { pickupFeaturedLogtoSkus } from '@/utils/subscription';

import { type CreateTenantData } from '../types';

import SkuCardItem from './SkuCardItem';
import styles from './index.module.scss';

type Props = {
  readonly tenantData?: CreateTenantData;
  readonly onClose: (tenant?: TenantResponse) => void;
};

function SelectTenantPlanModal({ tenantData, onClose }: Props) {
  const [processingSkuId, setProcessingSkuId] = useState<string>();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const { data: logtoSkus } = useLogtoSkus();

  const { subscribe } = useSubscribe();
  const cloudApi = useCloudApi({ hideErrorToast: true });

  const reservedBasicLogtoSkus = conditional(logtoSkus && pickupFeaturedLogtoSkus(logtoSkus));

  if (!reservedBasicLogtoSkus || !tenantData) {
    return null;
  }

  const handleSelectSku = async (logtoSku: LogtoSkuResponse) => {
    const { id: skuId } = logtoSku;
    try {
      setProcessingSkuId(skuId);
      if (skuId === ReservedPlanId.Free) {
        const { name, tag, regionName } = tenantData;
        const newTenant = await cloudApi.post('/api/tenants', { body: { name, tag, regionName } });

        reportToGoogle(GtagConversionId.CreateProductionTenant, { transactionId: newTenant.id });
        onClose(newTenant);
        return;
      }

      await subscribe({ skuId, planId: skuId, tenantData });
    } catch (error: unknown) {
      void toastResponseError(error);
    } finally {
      setProcessingSkuId(undefined);
    }
  };

  return (
    <Modal
      shouldCloseOnEsc
      isOpen={Boolean(tenantData)}
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={() => {
        onClose();
      }}
    >
      <ModalLayout
        title="upsell.create_tenant.title"
        subtitle={
          <DangerousRaw>
            <Trans components={{ a: <TextLink href={pricingLink} targetBlank="noopener" /> }}>
              {t('upsell.create_tenant.description')}
            </Trans>
          </DangerousRaw>
        }
        size="large"
        onClose={onClose}
      >
        <div className={styles.container}>
          {reservedBasicLogtoSkus.map((logtoSku) => (
            <SkuCardItem
              key={logtoSku.id}
              sku={logtoSku}
              buttonProps={{
                isLoading: processingSkuId === logtoSku.id,
                disabled: Boolean(processingSkuId),
              }}
              onSelect={() => {
                void handleSelectSku(logtoSku);
              }}
            />
          ))}
        </div>
      </ModalLayout>
    </Modal>
  );
}

export default SelectTenantPlanModal;
