import { type Hook, type CreateHook, type HookEvent, type HookConfig } from '@logto/schemas';
import { FormProvider, useForm } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';

import ContactUsPhraseLink from '@/components/ContactUsPhraseLink';
import PlanName from '@/components/PlanName';
import QuotaGuardFooter from '@/components/QuotaGuardFooter';
import Button from '@/ds-components/Button';
import ModalLayout from '@/ds-components/ModalLayout';
import useApi from '@/hooks/use-api';
import useCurrentSubscriptionPlan from '@/hooks/use-current-subscription-plan';
import { trySubmitSafe } from '@/utils/form';
import { hasReachedQuotaLimit } from '@/utils/quota';

import { type BasicWebhookFormType } from '../../types';
import BasicWebhookForm from '../BasicWebhookForm';

type Props = {
  totalWebhookCount: number;
  onClose: (createdHook?: Hook) => void;
};

type CreateHookPayload = Pick<CreateHook, 'name'> & {
  events: HookEvent[];
  config: {
    url: HookConfig['url'];
  };
};

function CreateForm({ totalWebhookCount, onClose }: Props) {
  const { data: currentPlan } = useCurrentSubscriptionPlan();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const shouldBlockCreation = hasReachedQuotaLimit({
    quotaKey: 'hooksLimit',
    usage: totalWebhookCount,
    plan: currentPlan,
  });

  const formMethods = useForm<BasicWebhookFormType>();
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = formMethods;

  const api = useApi();

  const onSubmit = handleSubmit(
    trySubmitSafe(async (data) => {
      const { name, events, url } = data;
      const payload: CreateHookPayload = {
        name,
        events,
        config: {
          url,
        },
      };

      const created = await api.post('api/hooks', { json: payload }).json<Hook>();
      onClose(created);
    })
  );

  return (
    <ModalLayout
      title="webhooks.create_form.title"
      subtitle="webhooks.create_form.subtitle"
      footer={
        shouldBlockCreation && currentPlan ? (
          <QuotaGuardFooter>
            <Trans
              components={{
                a: <ContactUsPhraseLink />,
                planName: <PlanName name={currentPlan.name} />,
              }}
            >
              {t('upsell.paywall.hooks', { count: currentPlan.quota.hooksLimit })}
            </Trans>
          </QuotaGuardFooter>
        ) : (
          <Button
            disabled={isSubmitting}
            htmlType="submit"
            title="webhooks.create_form.create_webhook"
            size="large"
            type="primary"
            onClick={onSubmit}
          />
        )
      }
      onClose={onClose}
    >
      <FormProvider {...formMethods}>
        <BasicWebhookForm />
      </FormProvider>
    </ModalLayout>
  );
}

export default CreateForm;
