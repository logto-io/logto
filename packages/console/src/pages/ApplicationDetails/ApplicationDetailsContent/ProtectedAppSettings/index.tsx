import { type Application } from '@logto/schemas';
import { type ChangeEvent } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';

import ExternalLinkIcon from '@/assets/icons/external-link.svg';
import FormCard from '@/components/FormCard';
import Button from '@/ds-components/Button';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import FormField from '@/ds-components/FormField';
import TextInput from '@/ds-components/TextInput';
import NumericInput from '@/ds-components/TextInput/NumericInput';
import useDocumentationUrl from '@/hooks/use-documentation-url';

import { type ApplicationForm } from '../utils';

import * as styles from './index.module.scss';

type Props = {
  data: Application;
};

const routes = Object.freeze(['/register', '/sign-in', '/sign-in-callback', '/sign-out']);
const maxSessionDuration = 365; // 1 year

function ProtectedAppSettings({ data }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { getDocumentationUrl } = useDocumentationUrl();

  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ApplicationForm>();

  const { fields } = useFieldArray({
    control,
    name: 'protectedAppMetadata.pageRules',
  });

  const host = data.protectedAppMetadata?.host;

  return (
    <>
      <FormCard
        title="application_details.integration"
        description="application_details.integration_description"
        learnMoreLink={{
          href: getDocumentationUrl('/docs/references/applications'),
          targetBlank: 'noopener',
        }}
      >
        {!!host && (
          <div className={styles.launcher}>
            <span>{t('protected_app.success_message')}</span>
            <Button
              className={styles.button}
              size="small"
              title="application_details.try_it"
              trailingIcon={<ExternalLinkIcon />}
              onClick={() => {
                window.open(`https://${host}`, '_blank');
              }}
            />
          </div>
        )}
        <FormField isRequired title="application_details.application_name">
          <TextInput
            {...register('name', { required: true })}
            error={Boolean(errors.name)}
            placeholder={t('application_details.application_name_placeholder')}
          />
        </FormField>
        <FormField
          isRequired
          title="protected_app.form.url_field_label"
          tip={<span className={styles.tip}>{t('application_details.origin_url_tip')}</span>}
        >
          <TextInput
            {...register('protectedAppMetadata.origin', { required: true })}
            error={Boolean(errors.protectedAppMetadata?.origin)}
            placeholder={t('protected_app.form.url_field_placeholder')}
          />
        </FormField>
        <FormField
          title="application_details.custom_rules"
          description="application_details.custom_rules_description"
          descriptionPosition="top"
          tip={
            <span className={styles.tip}>
              <Trans components={{ ol: <ol />, li: <li /> }}>
                {t('application_details.custom_rules_tip')}
              </Trans>
            </span>
          }
        >
          {fields.map((field, index) => (
            <TextInput
              key={field.id}
              {...register(`protectedAppMetadata.pageRules.${index}.path`)}
              error={Boolean(errors.protectedAppMetadata?.pageRules?.[index]?.path)}
              placeholder={t('application_details.custom_rules_placeholder')}
            />
          ))}
        </FormField>
      </FormCard>
      <FormCard
        title="application_details.service_configuration"
        description="application_details.service_configuration_description"
      >
        <FormField
          title="application_details.authentication_routes"
          description="application_details.authentication_routes_description"
          descriptionPosition="top"
        >
          <div className={styles.routes}>
            {routes.map((route) => (
              <CopyToClipboard key={route} variant="border" value={route} />
            ))}
          </div>
        </FormField>
      </FormCard>
      <FormCard title="application_details.session">
        <FormField title="application_details.session_duration">
          <Controller
            name="protectedAppMetadata.sessionDuration"
            control={control}
            rules={{
              min: 1,
            }}
            render={({ field: { onChange, value, name } }) => (
              <NumericInput
                className={styles.sessionDuration}
                name={name}
                placeholder="14"
                value={String(value)}
                min={1}
                max={maxSessionDuration}
                error={Boolean(errors.protectedAppMetadata?.sessionDuration)}
                onChange={({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
                  onChange(value && Number(value));
                }}
                onValueUp={() => {
                  onChange(value + 1);
                }}
                onValueDown={() => {
                  onChange(value - 1);
                }}
                onBlur={() => {
                  if (value < 1) {
                    onChange(1);
                  } else if (value > maxSessionDuration) {
                    onChange(maxSessionDuration);
                  }
                }}
              />
            )}
          />
        </FormField>
      </FormCard>
    </>
  );
}

export default ProtectedAppSettings;
