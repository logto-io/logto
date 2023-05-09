import { type Hook, type CreateHook, HookEvent, type HookConfig } from '@logto/schemas';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import { CheckboxGroup } from '@/components/Checkbox';
import FormField from '@/components/FormField';
import ModalLayout from '@/components/ModalLayout';
import TextInput from '@/components/TextInput';
import { hookEventLabel } from '@/consts/webhooks';
import useApi from '@/hooks/use-api';
import { uriValidator } from '@/utils/validator';

import * as styles from './CreateForm.module.scss';

type Props = {
  onClose: (createdHook?: Hook) => void;
};

type FormData = Pick<CreateHook, 'name'> & {
  events: HookEvent[];
  url: HookConfig['url'];
};

type CreateHookPayload = Pick<CreateHook, 'name'> & {
  events: HookEvent[];
  config: {
    url: HookConfig['url'];
  };
};

const hookEventOptions = Object.values(HookEvent).map((event) => ({
  title: hookEventLabel[event],
  value: event,
}));

function CreateForm({ onClose }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const {
    handleSubmit,
    register,
    control,
    formState: { isSubmitting, errors },
  } = useForm<FormData>();

  const api = useApi();

  const onSubmit = handleSubmit(async (data) => {
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
  });

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
      <FormField title="webhooks.create_form.events">
        <div className={styles.formFieldDescription}>
          {t('webhooks.create_form.events_description')}
        </div>
        <Controller
          name="events"
          control={control}
          defaultValue={[]}
          rules={{
            validate: (value) =>
              value.length === 0 ? t('webhooks.create_form.missing_event_error') : true,
          }}
          render={({ field: { onChange, value } }) => (
            <CheckboxGroup options={hookEventOptions} value={value} onChange={onChange} />
          )}
        />
        {errors.events && <div className={styles.errorMessage}>{errors.events.message}</div>}
      </FormField>
      <FormField isRequired title="webhooks.create_form.name">
        <TextInput
          {...register('name', { required: true })}
          placeholder={t('webhooks.create_form.name_placeholder')}
          error={Boolean(errors.name)}
        />
      </FormField>
      <FormField
        isRequired
        title="webhooks.create_form.endpoint_url"
        tip={t('webhooks.create_form.endpoint_url_tip')}
      >
        <TextInput
          {...register('url', {
            required: true,
            validate: (value) => {
              if (!uriValidator(value)) {
                return t('errors.invalid_uri_format');
              }
              return value.startsWith('https://') || t('webhooks.create_form.https_format_error');
            },
          })}
          placeholder={t('webhooks.create_form.endpoint_url_placeholder')}
          error={errors.url?.type === 'required' ? true : errors.url?.message}
        />
      </FormField>
    </ModalLayout>
  );
}

export default CreateForm;
