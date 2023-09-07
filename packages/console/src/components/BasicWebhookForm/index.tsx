import { HookEvent, type Hook, type HookConfig } from '@logto/schemas';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { hookEventLabel } from '@/consts/webhooks';
import { CheckboxGroup } from '@/ds-components/Checkbox';
import FormField from '@/ds-components/FormField';
import TextInput from '@/ds-components/TextInput';
import { uriValidator } from '@/utils/validator';

import * as styles from './index.module.scss';

const hookEventOptions = Object.values(HookEvent).map((event) => ({
  title: hookEventLabel[event],
  value: event,
}));

export type BasicWebhookFormType = {
  name: Hook['name'];
  events: HookEvent[];
  url: HookConfig['url'];
};

function BasicWebhookForm() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<BasicWebhookFormType>();

  return (
    <>
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
    </>
  );
}

export default BasicWebhookForm;
