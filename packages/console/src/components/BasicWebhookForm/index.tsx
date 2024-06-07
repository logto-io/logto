import { type Hook, type HookConfig, type HookEvent } from '@logto/schemas';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  dataHookEventsLabel,
  interactionHookEvents,
  schemaGroupedDataHookEvents,
} from '@/consts/webhooks';
import CategorizedCheckboxGroup, {
  type CheckboxOptionGroup,
} from '@/ds-components/Checkbox/CategorizedCheckboxGroup';
import FormField from '@/ds-components/FormField';
import TextInput from '@/ds-components/TextInput';
import { uriValidator } from '@/utils/validator';

import * as styles from './index.module.scss';

const hookEventGroups: Array<CheckboxOptionGroup<HookEvent>> = [
  ...schemaGroupedDataHookEvents.map(([schema, events]) => ({
    title: dataHookEventsLabel[schema],
    options: events.map((event) => ({
      value: event,
    })),
  })),
  {
    title: 'webhooks.schemas.interaction',
    options: interactionHookEvents.map((event) => ({
      value: event,
    })),
  },
];

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
            validate: (value) => uriValidator(value) || t('errors.invalid_uri_format'),
          })}
          placeholder={t('webhooks.create_form.endpoint_url_placeholder')}
          error={errors.url?.type === 'required' ? true : errors.url?.message}
        />
      </FormField>
      <FormField
        title="webhooks.create_form.events"
        tip={t('webhooks.create_form.events_description')}
      >
        <Controller
          name="events"
          control={control}
          defaultValue={[]}
          rules={{
            validate: (value) =>
              value.length === 0 ? t('webhooks.create_form.missing_event_error') : true,
          }}
          render={({ field: { onChange, value } }) => (
            <CategorizedCheckboxGroup value={value} groups={hookEventGroups} onChange={onChange} />
          )}
        />
        {errors.events && <div className={styles.errorMessage}>{errors.events.message}</div>}
      </FormField>
    </>
  );
}

export default BasicWebhookForm;
