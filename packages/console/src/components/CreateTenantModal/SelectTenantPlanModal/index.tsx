import { toast } from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';
import Modal from 'react-modal';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { ReservedPlanId } from '@/consts/subscriptions';
import DangerousRaw from '@/ds-components/DangerousRaw';
import ModalLayout from '@/ds-components/ModalLayout';
import TextLink from '@/ds-components/TextLink';
import useSubscribe from '@/hooks/use-subscribe';
import useSubscriptionPlans from '@/hooks/use-subscription-plans';
import * as modalStyles from '@/scss/modal.module.scss';
import { type SubscriptionPlan } from '@/types/subscriptions';
import type { TenantInfo } from '@/types/tenant';

import { type CreateTenantData } from '../type';

import PlanCardItem from './PlanCardItem';
import * as styles from './index.module.scss';

type Props = {
  tenantData?: CreateTenantData;
  onClose: (tenant?: TenantInfo) => void;
};

function SelectTenantPlanModal({ tenantData, onClose }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data: subscriptionPlans } = useSubscriptionPlans();
  const { subscribe } = useSubscribe();
  const cloudApi = useCloudApi();
  if (!subscriptionPlans || !tenantData) {
    return null;
  }

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    const { id: planId } = plan;
    if (planId === ReservedPlanId.free) {
      try {
        const { name, tag } = tenantData;
        const newTenant = await cloudApi.post('/api/tenants', { body: { name, tag } });

        onClose(newTenant);
      } catch (error: unknown) {
        toast.error(error instanceof Error ? error.message : String(error));
      }
    }

    void subscribe({ planId, tenantData });
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
            <Trans
              components={{
                a: <TextLink href="https://logto.io/pricing" target="_blank" />,
              }}
            >
              {t('upsell.create_tenant.description')}
            </Trans>
          </DangerousRaw>
        }
        size="xlarge"
        onClose={onClose}
      >
        <div className={styles.container}>
          {subscriptionPlans.map((plan) => (
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
