import { type Hook, type CreateHook, type HookEvent, type HookConfig } from '@logto/schemas';
import { useContext } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';

import BasicWebhookForm, { type BasicWebhookFormType } from '@/components/BasicWebhookForm';
import ContactUsPhraseLink from '@/components/ContactUsPhraseLink';
import QuotaGuardFooter from '@/components/QuotaGuardFooter';
import SkuName from '@/components/SkuName';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import Button from '@/ds-components/Button';
import ModalLayout from '@/ds-components/ModalLayout';
import useApi from '@/hooks/use-api';
import { trySubmitSafe } from '@/utils/form';
import { hasReachedSubscriptionQuotaLimit } from '@/utils/quota';

type Props = {
  readonly onClose: (createdHook?: Hook) => void;
};

type CreateHookPayload = Pick<CreateHook, 'name'> & {
  events: HookEvent[];
  config: {
    url: HookConfig['url'];
  };
};

function CreateForm({ onClose }: Props) {
  const {
    currentSubscription: { planId, isEnterprisePlan },
    currentSubscriptionQuota,
    currentSubscriptionUsage,
  } = useContext(SubscriptionDataContext);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const shouldBlockCreation = hasReachedSubscriptionQuotaLimit({
    quotaKey: 'hooksLimit',
    usage: currentSubscriptionUsage.hooksLimit,
    quota: currentSubscriptionQuota,
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
        shouldBlockCreation ? (
          <QuotaGuardFooter>
            <Trans
              components={{
                a: <ContactUsPhraseLink />,
                planName: <SkuName skuId={planId} isEnterprisePlan={isEnterprisePlan} />,
              }}
            >
              {t('upsell.paywall.hooks', {
                count: currentSubscriptionUsage.hooksLimit,
              })}
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
      size="large"
      onClose={onClose}
    >
      <FormProvider {...formMethods}>
        <BasicWebhookForm />
      </FormProvider>
    </ModalLayout>
  );
}

export default CreateForm;
