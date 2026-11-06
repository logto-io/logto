import { type Application, type ApplicationApiResponse, ApplicationType } from '@logto/schemas';
import { useFormContext } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';

import FormCard from '@/components/FormCard';
import RefreshTokenTtlField from '@/components/RefreshTokenTtlField';
import FormField from '@/ds-components/FormField';
import Switch from '@/ds-components/Switch';
import TextLink from '@/ds-components/TextLink';

type Props = {
  readonly data: ApplicationApiResponse;
};

function RefreshTokenSettings({ data: { type } }: Props) {
  const { register } = useFormContext<Application & { isAdmin?: boolean }>();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

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
              {t(
                [ApplicationType.Native, ApplicationType.SPA].includes(type)
                  ? 'application_details.rotate_refresh_token_label_for_public_clients'
                  : 'application_details.rotate_refresh_token_label'
              )}
            </Trans>
          }
          {...register('customClientMetadata.rotateRefreshToken')}
        />
      </FormField>
      <RefreshTokenTtlField<Application>
        name="customClientMetadata.refreshTokenTtlInDays"
        tip={t('application_details.refresh_token_ttl_tip')}
      />
    </FormCard>
  );
}

export default RefreshTokenSettings;
