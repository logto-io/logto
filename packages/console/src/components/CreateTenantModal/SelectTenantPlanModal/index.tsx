import { ReservedPlanId } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { Trans, useTranslation } from 'react-i18next';
import Modal from 'react-modal';

import { useCloudApi, toastResponseError } from '@/cloud/hooks/use-cloud-api';
import { type TenantResponse } from '@/cloud/types/router';
import { GtagConversionId, reportToGoogle } from '@/components/Conversion/utils';
import { pricingLink } from '@/consts';
import DangerousRaw from '@/ds-components/DangerousRaw';
import ModalLayout from '@/ds-components/ModalLayout';
import TextLink from '@/ds-components/TextLink';
import useSubscribe from '@/hooks/use-subscribe';
import useSubscriptionPlans from '@/hooks/use-subscription-plans';
import * as modalStyles from '@/scss/modal.module.scss';
import { type SubscriptionPlan } from '@/types/subscriptions';
import { pickupFeaturedPlans } from '@/utils/subscription';

import { type CreateTenantData } from '../types';

import PlanCardItem from './PlanCardItem';
import * as styles from './index.module.scss';

type Props = {
  readonly tenantData?: CreateTenantData;
  readonly onClose: (tenant?: TenantResponse) => void;
};

function SelectTenantPlanModal({ tenantData, onClose }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data: subscriptionPlans } = useSubscriptionPlans();
  const { subscribe } = useSubscribe();
  const cloudApi = useCloudApi({ hideErrorToast: true });
  const reservedPlans = conditional(subscriptionPlans && pickupFeaturedPlans(subscriptionPlans));

  if (!reservedPlans || !tenantData) {
    return null;
  }

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    const { id: planId } = plan;
    try {
      if (planId === ReservedPlanId.Free) {
        const { name, tag, regionName } = tenantData;
        const newTenant = await cloudApi.post('/api/tenants', { body: { name, tag, regionName } });

        reportToGoogle(GtagConversionId.CreateProductionTenant, { transactionId: newTenant.id });
        onClose(newTenant);
        return;
      }

      await subscribe({ planId, tenantData });
    } catch (error: unknown) {
      void toastResponseError(error);
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
          {reservedPlans.map((plan) => (
            <PlanCardItem
              key={plan.id}
              plan={plan}
              onSelect={() => {
                void handleSelectPlan(plan);
              }}
            />
          ))}
        </div>
      </ModalLayout>
    </Modal>
  );
}

export default SelectTenantPlanModal;
