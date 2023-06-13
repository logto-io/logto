import { type Hook, type CreateHook, type HookEvent, type HookConfig } from '@logto/schemas';
import { FormProvider, useForm } from 'react-hook-form';

import Button from '@/components/Button';
import ModalLayout from '@/components/ModalLayout';
import useApi from '@/hooks/use-api';
import { trySubmitSafe } from '@/utils/form';

import { type BasicWebhookFormType } from '../../types';
import BasicWebhookForm from '../BasicWebhookForm';

type Props = {
  onClose: (createdHook?: Hook) => void;
};

type CreateHookPayload = Pick<CreateHook, 'name'> & {
  events: HookEvent[];
  config: {
    url: HookConfig['url'];
  };
};

function CreateForm({ onClose }: Props) {
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
        <Button
          disabled={isSubmitting}
          htmlType="submit"
          title="webhooks.create_form.create_webhook"
          size="large"
          type="primary"
          onClick={onSubmit}
        />
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
