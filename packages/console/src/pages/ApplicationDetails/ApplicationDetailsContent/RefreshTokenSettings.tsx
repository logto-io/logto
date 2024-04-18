import { type Application, ApplicationType, customClientMetadataGuard } from '@logto/schemas';
import { useFormContext } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';

import FormCard from '@/components/FormCard';
import FormField from '@/ds-components/FormField';
import Switch from '@/ds-components/Switch';
import TextInput from '@/ds-components/TextInput';
import TextLink from '@/ds-components/TextLink';

type Props = {
  readonly data: Application;
};

function RefreshTokenSettings({ data: { type } }: Props) {
  const {
    register,
    formState: { errors },
  } = useFormContext<Application & { isAdmin?: boolean }>();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const { minValue, maxValue } =
    customClientMetadataGuard.shape.refreshTokenTtlInDays._def.innerType;

  const minTtl = minValue ?? Number.NEGATIVE_INFINITY;
  const maxTtl = maxValue ?? Number.POSITIVE_INFINITY;

  const ttlErrorMessage = t('errors.number_should_be_between_inclusive', {
    min: minTtl,
    max: maxTtl,
  });

  return (
    <FormCard
      title="application_details.refresh_token_settings"
      description="application_details.refresh_token_settings_description"
    >
      {[ApplicationType.Traditional, ApplicationType.SPA].includes(type) && (
        <FormField title="application_details.always_issue_refresh_token">
          <Switch
            label={t('application_details.always_issue_refresh_token_label')}
            {...register('customClientMetadata.alwaysIssueRefreshToken')}
          />
        </FormField>
      )}
      <FormField title="application_details.rotate_refresh_token">
        <Switch
          label={
            <Trans
              components={{
                a: (
                  <TextLink
                    href="https://docs.logto.io/docs/references/applications/#rotate-refresh-token"
                    targetBlank="noopener"
                  />
                ),
              }}
            >
              {t('application_details.rotate_refresh_token_label')}
            </Trans>
          }
          {...register('customClientMetadata.rotateRefreshToken')}
        />
      </FormField>
      <FormField
        title="application_details.refresh_token_ttl"
        tip={t('application_details.refresh_token_ttl_tip')}
      >
        <TextInput
          {...register('customClientMetadata.refreshTokenTtlInDays', {
            min: {
              value: minTtl,
              message: ttlErrorMessage,
            },
            max: {
              value: maxTtl,
              message: ttlErrorMessage,
            },
            valueAsNumber: true,
            validate: (value) =>
              value === undefined || Number.isInteger(value) || t('errors.should_be_an_integer'),
          })}
          placeholder="14"
          // Confirm if we need a customized message here
          error={errors.customClientMetadata?.refreshTokenTtlInDays?.message}
        />
      </FormField>
    </FormCard>
  );
}

export default RefreshTokenSettings;
