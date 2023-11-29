import { isManagementApi, type Resource } from '@logto/schemas';
import { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';
import Modal from 'react-modal';
import useSWR from 'swr';

import ContactUsPhraseLink from '@/components/ContactUsPhraseLink';
import PlanName from '@/components/PlanName';
import QuotaGuardFooter from '@/components/QuotaGuardFooter';
import { type ApiResource } from '@/consts';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import FormField from '@/ds-components/FormField';
import ModalLayout from '@/ds-components/ModalLayout';
import TextInput from '@/ds-components/TextInput';
import TextLink from '@/ds-components/TextLink';
import useApi from '@/hooks/use-api';
import useSubscriptionPlan from '@/hooks/use-subscription-plan';
import * as modalStyles from '@/scss/modal.module.scss';
import { trySubmitSafe } from '@/utils/form';
import { hasReachedQuotaLimit } from '@/utils/quota';

type FormData = {
  name: string;
  indicator: string;
};

type Props = {
  onClose?: (createdApiResource?: Resource) => void;
};

function CreateForm({ onClose }: Props) {
  const { currentTenantId } = useContext(TenantsContext);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data: currentPlan } = useSubscriptionPlan(currentTenantId);
  const { data: allResources } = useSWR<ApiResource[]>('api/resources');

  const {
    handleSubmit,
    register,
    formState: { isSubmitting },
  } = useForm<FormData>();

  const resourceCount =
    allResources?.filter(({ indicator }) => !isManagementApi(indicator)).length ?? 0;

  const isResourcesReachLimit = hasReachedQuotaLimit({
    quotaKey: 'resourcesLimit',
    plan: currentPlan,
    usage: resourceCount,
  });

  const api = useApi();

  const onSubmit = handleSubmit(
    trySubmitSafe(async (data) => {
      if (isSubmitting) {
        return;
      }

      const createdApiResource = await api.post('api/resources', { json: data }).json<Resource>();
      toast.success(t('api_resources.api_resource_created', { name: createdApiResource.name }));
      onClose?.(createdApiResource);
    })
  );

  return (
    <Modal
      shouldCloseOnEsc
      isOpen
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={() => {
        onClose?.();
      }}
    >
      <ModalLayout
        title="api_resources.create"
        subtitle="api_resources.subtitle"
        footer={
          isResourcesReachLimit && currentPlan ? (
            <QuotaGuardFooter>
              <Trans
                components={{
                  a: <ContactUsPhraseLink />,
                  planName: <PlanName name={currentPlan.name} />,
                }}
              >
                {t('upsell.paywall.resources', {
                  count: currentPlan.quota.resourcesLimit ?? 0,
                })}
              </Trans>
            </QuotaGuardFooter>
          ) : (
            <Button
              isLoading={isSubmitting}
              htmlType="submit"
              title="api_resources.create"
              size="large"
              type="primary"
              onClick={onSubmit}
            />
          )
        }
        onClose={onClose}
      >
        <form>
          <FormField isRequired title="api_resources.api_name">
            <TextInput
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              {...register('name', { required: true })}
              placeholder={t('api_resources.api_name_placeholder')}
            />
          </FormField>
          <FormField
            isRequired
            title="api_resources.api_identifier"
            tip={(closeTipHandler) => (
              <Trans
                components={{
                  a: (
                    <TextLink
                      targetBlank
                      href="https://datatracker.ietf.org/doc/html/rfc8707#section-2"
                      onClick={closeTipHandler}
                    />
                  ),
                }}
              >
                {t('api_resources.api_identifier_tip')}
              </Trans>
            )}
          >
            <TextInput
              {...register('indicator', { required: true })}
              placeholder={t('api_resources.api_identifier_placeholder')}
            />
          </FormField>
        </form>
      </ModalLayout>
    </Modal>
  );
}

export default CreateForm;
